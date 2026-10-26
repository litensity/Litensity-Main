import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { adminDb, missingContentReport } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/auth";
import { Notices } from "@/components/admin/Notices";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DismissibleAlert } from "@/components/admin/DismissibleAlert";
import { deleteRecord, removeSampleContent } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Request-time cutoff (dashboard is dynamic; never cached). */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const [admin, sp, db, jar] = await Promise.all([requireAdmin(), searchParams, adminDb(), cookies()]);

  const [brands, liveStores, soonStores, openJobs, drafts, leadsWeek, recent, missing, initiatives] = await Promise.all([
    db.from("brands").select("id, name, status, slug, feature_investment").order("sort_order"),
    db.from("stores").select("*", { count: "exact", head: true }).eq("store_status", "live").eq("is_archived", false),
    db.from("stores").select("*", { count: "exact", head: true }).eq("store_status", "opening_soon").eq("is_archived", false),
    db.from("jobs").select("*", { count: "exact", head: true }).eq("is_open", true).eq("status", "published"),
    Promise.all(["brands", "products", "people", "jobs", "csr_initiatives", "investment_models", "downloads"].map((t) => db.from(t).select("*", { count: "exact", head: true }).eq("status", "draft"))),
    db.from("lead_submissions").select("*", { count: "exact", head: true }).gte("created_at", daysAgo(7)),
    db.from("lead_submissions").select("id, form_key, brand_slug, email, created_at").order("created_at", { ascending: false }).limit(8),
    missingContentReport(),
    db.from("csr_initiatives").select("*", { count: "exact", head: true }),
  ]);
  const { count: sampleCount } = await db.from("sample_records").select("*", { count: "exact", head: true });
  // A dismissed alert stays hidden until what it reports changes.
  const sampleSignature = String(sampleCount ?? 0);
  const draftCount = drafts.reduce((sum, r) => sum + (r.count ?? 0), 0);

  const cards = [
    { label: "Live stores", value: liveStores.count ?? 0, href: "/admin/r/stores?store_status=live" },
    { label: "Opening soon", value: soonStores.count ?? 0, href: "/admin/r/stores?store_status=opening_soon" },
    { label: "Open roles", value: openJobs.count ?? 0, href: "/admin/r/jobs" },
    { label: "CSR initiatives", value: initiatives.count ?? 0, href: "/admin/r/csr-initiatives" },
    { label: "Leads this week", value: leadsWeek.count ?? 0, href: "/admin/r/leads" },
    { label: "Drafts awaiting publish", value: draftCount, href: "/admin/r/brands?status=draft" },
  ];

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Welcome{admin.displayName ? `, ${admin.displayName}` : ""}</h1>
          <p>Everything on the website is managed here. Published changes go live immediately.</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/r/stores/new" className="a-btn">
            Add store
          </Link>
          <Link href="/admin/r/jobs/new" className="a-btn">
            Add role
          </Link>
          <Link href="/admin/media" className="a-btn a-btn-primary">
            Upload media
          </Link>
        </div>
      </header>
      <Notices searchParams={sp} />

      {sp.samples === "removed" && <p className="a-alert a-alert-ok">All sample content has been removed.</p>}
      {(sampleCount ?? 0) > 0 && jar.get("dismiss_samples")?.value !== sampleSignature && (
        <DismissibleAlert cookie="dismiss_samples" signature={sampleSignature} className="a-alert-warn">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <strong>Sample content is loaded</strong> — {sampleCount} sample pictures and records are filling empty spots so you can preview the design.
              Replace them with real content, or remove them all before launch.
            </span>
            <form action={removeSampleContent}>
              <ConfirmButton message="Remove all sample pictures, products, gallery items, campaigns and initiatives? Your own content is not affected." className="a-btn a-btn-sm a-btn-danger">
                Remove sample content
              </ConfirmButton>
            </form>
          </div>
        </DismissibleAlert>
      )}

      <div className="a-cards">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="a-card">
            <span className="a-card-value">{c.value}</span>
            <span className="a-card-label">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="a-two">
        <div>
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>Brands</h2>
              <Link href="/admin/r/brands/new" className="a-btn a-btn-sm">
                Add brand
              </Link>
            </div>
            <div className="a-list">
              {(brands.data ?? []).map((b) => (
                <Link key={b.id} href={`/admin/r/brands/${b.id}`}>
                  <span className="a-link">{b.name}</span>
                  <span>
                    {b.feature_investment && <span className="a-badge">Investment</span>} <span className={`a-badge a-badge-${b.status}`}>{b.status}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="a-panel">
            <div className="a-panel-head">
              <h2>Recent leads</h2>
              <Link href="/admin/r/leads" className="a-btn a-btn-sm">
                All leads
              </Link>
            </div>
            {(recent.data ?? []).length === 0 ? (
              <p className="a-empty">No submissions yet.</p>
            ) : (
              <div className="a-list">
                {(recent.data ?? []).map((l) => (
                  <div key={l.id} className="a-list-row">
                    <Link href={`/admin/r/leads/${l.id}`}>
                      <span>
                        <span className="a-link">{l.form_key}</span>
                        {l.brand_slug ? ` · ${l.brand_slug}` : ""} · {l.email}
                      </span>
                      <span className="admin-muted">{dateFormat.format(new Date(l.created_at))}</span>
                    </Link>
                    <form action={deleteRecord.bind(null, "leads", l.id, "/admin?deleted=1")}>
                      <ConfirmButton
                        message={`Delete the ${l.form_key} lead from ${l.email || "this visitor"}? This can't be undone.`}
                        className="a-btn a-btn-sm a-btn-danger"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="a-panel">
          <div className="a-panel-head">
            <div>
              <h2>Content still required</h2>
              <p>Fields marked “[CLIENT CONTENT REQUIRED]” are hidden on the live site until replaced.</p>
            </div>
          </div>
          {missing.length === 0 ? (
            <p className="a-empty">All placeholder content has been replaced. 🎉</p>
          ) : (
            <div className="a-list">
              {missing.map((m) => (
                <Link key={m.label} href={m.resource === "page-sections" || m.resource === "lists" ? "/admin/pages" : `/admin/r/${m.resource}?q=CLIENT CONTENT REQUIRED`}>
                  <span className="a-link">{m.label}</span>
                  <span className="a-badge a-badge-draft">{m.count}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
