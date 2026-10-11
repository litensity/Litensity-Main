import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { countLeads, EXPORT_FORMS, filterForms, parseExportFilter, type LeadExportFilter } from "@/lib/leads/export";

export const metadata: Metadata = { title: "Export leads" };

/** Today's date in India, as YYYY-MM-DD. */
function todayIst(): string {
  return new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

function shiftDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function presets(today: string): { label: string; from: string; to: string }[] {
  const y = today.slice(0, 4);
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthEnd = shiftDays(monthStart, -1);
  return [
    { label: "Today", from: today, to: today },
    { label: "Last 7 days", from: shiftDays(today, -6), to: today },
    { label: "This month", from: monthStart, to: today },
    { label: "Last month", from: `${lastMonthEnd.slice(0, 7)}-01`, to: lastMonthEnd },
    { label: `This year (${y})`, from: `${y}-01-01`, to: today },
    { label: "All time", from: "", to: "" },
  ];
}

function query(filter: Partial<LeadExportFilter>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) if (v && v !== "all") params.set(k, v);
  const s = params.toString();
  return s ? `?${s}` : "";
}

function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function ExportLeadsPage({ searchParams }: PageProps<"/admin/exports">) {
  await requireAdmin();
  const sp = await searchParams;
  const parsed = parseExportFilter(sp);
  const filter: LeadExportFilter = parsed.success ? parsed.data : { form: "all", brand: "", from: "", to: "" };
  const invalid = parsed.success ? null : (parsed.error.issues[0]?.message ?? "Please check the filters.");

  const db = await createSessionClient();
  const [counts, { data: brands }, { data: settings }] = await Promise.all([
    countLeads(filter),
    db.from("brands").select("slug, name").order("sort_order"),
    db.from("form_settings").select("form_key, label"),
  ]);
  const labels = new Map((settings ?? []).map((s) => [s.form_key, s.label]));
  const selected = filterForms(filter);
  const total = selected.reduce((sum, f) => sum + counts[f], 0);
  const today = todayIst();
  const range =
    filter.from && filter.to
      ? `${formatDay(filter.from)} – ${formatDay(filter.to)}`
      : filter.from
        ? `From ${formatDay(filter.from)}`
        : filter.to
          ? `Up to ${formatDay(filter.to)}`
          : "All time";

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> / <Link href="/admin/r/leads">Leads</Link> / <span>Export</span>
          </p>
          <h1>Export leads to Excel</h1>
          <p>Download enquiries as an Excel file — one sheet per form, laid out like the Google Sheets. Dates are Indian time.</p>
        </div>
      </header>

      {invalid && (
        <p className="a-alert a-alert-bad" role="alert">
          {invalid}
        </p>
      )}
      {sp.error === "export-failed" && (
        <p className="a-alert a-alert-bad" role="alert">
          The export couldn&apos;t be created. Please try again; if it keeps failing, narrow the date range.
        </p>
      )}

      <form method="get" action="/admin/exports" className="a-panel">
        <div className="a-panel-head">
          <div>
            <h2>Filters</h2>
            <p>Pick a form and a date range, then download. Leave the dates empty for everything.</p>
          </div>
        </div>
        <div className="a-panel-body a-form">
          <div className="x-presets" role="group" aria-label="Quick date ranges">
            {presets(today).map((p) => {
              const active = p.from === filter.from && p.to === filter.to;
              return (
                <Link key={p.label} href={`/admin/exports${query({ ...filter, from: p.from, to: p.to })}`} className={`a-btn a-btn-sm${active ? " a-btn-primary" : ""}`} aria-current={active || undefined}>
                  {p.label}
                </Link>
              );
            })}
          </div>

          <div className="a-fields x-fields">
            <div className="a-field">
              <label className="a-label" htmlFor="x-from">
                From
              </label>
              <input id="x-from" className="a-input" type="date" name="from" defaultValue={filter.from} max={today} />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="x-to">
                To (inclusive)
              </label>
              <input id="x-to" className="a-input" type="date" name="to" defaultValue={filter.to} max={today} aria-invalid={invalid ? true : undefined} />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="x-form">
                Form
              </label>
              <select id="x-form" className="a-input" name="form" defaultValue={filter.form}>
                <option value="all">All forms (5 sheets)</option>
                {EXPORT_FORMS.map((f) => (
                  <option key={f} value={f}>
                    {labels.get(f) ?? f}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="x-brand">
                Brand
              </label>
              <select id="x-brand" className="a-input" name="brand" defaultValue={filter.brand}>
                <option value="">All brands</option>
                {(brands ?? []).map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="a-help">Investor enquiries have no brand, so they are left out when a brand is chosen.</p>
            </div>
          </div>

          <div className="admin-actions">
            <button type="submit" className="a-btn">
              Update counts
            </button>
            <button type="submit" className="a-btn a-btn-primary" formAction="/admin/exports/download">
              {filter.form === "all" ? "Download Excel — all forms" : "Download Excel"}
            </button>
            {(filter.from || filter.to || filter.brand || filter.form !== "all") && (
              <Link href="/admin/exports" className="a-btn">
                Reset
              </Link>
            )}
          </div>
        </div>
      </form>

      <section className="a-panel" aria-labelledby="x-sheets">
        <div className="a-panel-head">
          <div>
            <h2 id="x-sheets">Sheets</h2>
            <p>
              {total} {total === 1 ? "lead" : "leads"} · {range}
              {filter.brand ? ` · ${(brands ?? []).find((b) => b.slug === filter.brand)?.name ?? filter.brand}` : ""}. Download one form on its own, or all five together above.
            </p>
          </div>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">Sheet</th>
                <th scope="col">Leads</th>
                <th scope="col">
                  <span className="sr-only">Download</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {EXPORT_FORMS.map((f) => (
                <tr key={f}>
                  <td>
                    <strong>{labels.get(f) ?? f}</strong>
                  </td>
                  <td>{counts[f]}</td>
                  <td style={{ textAlign: "right" }}>
                    {invalid ? null : (
                      <a className="a-btn a-btn-sm" href={`/admin/exports/download${query({ ...filter, form: f })}`} download>
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
