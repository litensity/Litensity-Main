import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/admin/resources";
import { getSingleton, listRecords, mediaThumbs, PAGE_SIZE, pk, relationOptions } from "@/lib/admin/data";
import { RecordTable } from "@/components/admin/RecordTable";
import { RecordEditor } from "@/components/admin/RecordEditor";
import { Notices } from "@/components/admin/Notices";

export async function generateMetadata({ params }: PageProps<"/admin/r/[resource]">): Promise<Metadata> {
  const { resource } = await params;
  return { title: getResource(resource)?.label ?? "Admin" };
}

export default async function ResourceListPage({ params, searchParams }: PageProps<"/admin/r/[resource]">) {
  const [{ resource: key }, sp] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource) notFound();

  if (resource.singleton) {
    const row = await getSingleton(resource);
    return <RecordEditor resource={resource} row={row} id={row ? String(row[pk(resource)]) : null} searchParams={sp} />;
  }

  const filters: Record<string, string> = {};
  for (const f of resource.filters ?? []) {
    const v = sp[f.name];
    if (typeof v === "string" && v) filters[f.name] = v;
  }
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Number(typeof sp.page === "string" ? sp.page : 1) || 1;

  const [{ rows, count }, options] = await Promise.all([listRecords(resource, { q, page, filters }), relationOptions(resource)]);
  const mediaCols = resource.list.filter((c) => c.format === "media").map((c) => c.name);
  const thumbs = await mediaThumbs(rows.flatMap((r) => mediaCols.map((c) => r[c] as string)));
  const createQuery = new URLSearchParams(Object.entries(filters).filter(([k]) => k !== "status")).toString();

  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...filters, ...(q ? { q } : {}) });
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    return `?${p.toString()}`;
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> / <span>{resource.group}</span>
          </p>
          <h1>{resource.label}</h1>
          {resource.description && <p>{resource.description}</p>}
        </div>
        <div className="admin-actions">
          {key === "media" && (
            <Link href="/admin/media" className="a-btn a-btn-primary">
              Upload files
            </Link>
          )}
          {resource.canCreate !== false && !resource.readOnly && (
            <Link href={`/admin/r/${resource.key}/new${createQuery ? `?${createQuery}` : ""}`} className="a-btn a-btn-primary">
              New {resource.singular.toLowerCase()}
            </Link>
          )}
        </div>
      </header>

      <Notices searchParams={sp} />

      <section className="a-panel">
        <form className="a-toolbar" method="get" role="search">
          {resource.search?.length ? <input type="search" name="q" defaultValue={q} placeholder="Search…" aria-label="Search" /> : null}
          {(resource.filters ?? []).map((f) => (
            <select key={f.name} name={f.name} defaultValue={filters[f.name] ?? ""} aria-label={f.label}>
              <option value="">All {f.label.toLowerCase()}</option>
              {(f.options ?? options[f.name] ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          {(resource.search?.length || resource.filters?.length) && (
            <>
              <button type="submit" className="a-btn">
                Apply
              </button>
              {(q || Object.keys(filters).length > 0) && (
                <Link href={`/admin/r/${resource.key}`} className="a-btn">
                  Reset
                </Link>
              )}
            </>
          )}
          <span className="admin-muted" style={{ marginLeft: "auto" }}>
            {count} {count === 1 ? "record" : "records"}
          </span>
        </form>

        <RecordTable resource={resource} rows={rows} options={options} thumbs={thumbs} returnTo={`/admin/r/${resource.key}${qs({ page })}`} />

        {count > PAGE_SIZE && (
          <div className="a-pager">
            <span>
              Page {page} of {Math.ceil(count / PAGE_SIZE)}
            </span>
            <span className="admin-actions">
              {page > 1 && (
                <Link className="a-btn a-btn-sm" href={qs({ page: page - 1 })}>
                  Previous
                </Link>
              )}
              {page * PAGE_SIZE < count && (
                <Link className="a-btn a-btn-sm" href={qs({ page: page + 1 })}>
                  Next
                </Link>
              )}
            </span>
          </div>
        )}
      </section>
    </>
  );
}
