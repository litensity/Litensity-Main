import Link from "next/link";
import type { Metadata } from "next";
import { getResource } from "@/lib/admin/resources";
import { listRecords, mediaThumbs } from "@/lib/admin/data";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Notices } from "@/components/admin/Notices";

export const metadata: Metadata = { title: "Media library" };

const sizeFormat = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export default async function MediaLibraryPage({ searchParams }: PageProps<"/admin/media">) {
  const sp = await searchParams;
  const resource = getResource("media")!;
  const kind = typeof sp.kind === "string" ? sp.kind : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const { rows, count } = await listRecords(resource, { q, filters: kind ? { kind } : {}, page: 1 });
  const thumbs = await mediaThumbs(rows.map((r) => String(r.id)));

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> / <span>Media</span>
          </p>
          <h1>Media library</h1>
          <p>
            Images and videos are public. PDFs (menus, brochures) are stored privately and only released after OTP verification. Add
            alt text to every image — it is used for accessibility and SEO.
          </p>
        </div>
      </header>
      <Notices searchParams={sp} />

      <section className="a-panel">
        <div className="a-panel-body">
          <MediaUploader />
        </div>
      </section>

      <section className="a-panel">
        <form className="a-toolbar" method="get">
          <input type="search" name="q" defaultValue={q} placeholder="Search by title, alt text or file name" aria-label="Search media" />
          <select name="kind" defaultValue={kind} aria-label="Type">
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          <button className="a-btn" type="submit">
            Apply
          </button>
          <span className="admin-muted" style={{ marginLeft: "auto" }}>
            {count} files {count > rows.length ? `(showing ${rows.length})` : ""}
          </span>
        </form>
        {rows.length === 0 ? (
          <p className="a-empty">No files yet.</p>
        ) : (
          <div className="a-grid">
            {rows.map((m) => {
              const t = thumbs[String(m.id)];
              return (
                <Link key={String(m.id)} href={`/admin/r/media/${m.id}`} className="a-tile">
                  {t?.url && t.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.url} alt="" className="a-tile-img" loading="lazy" />
                  ) : (
                    <span className="a-tile-img">{m.kind === "video" ? "VIDEO" : "PDF"}</span>
                  )}
                  <p>{String(m.title || m.path)}</p>
                  <p className="admin-muted">
                    {sizeFormat(Number(m.size_bytes))}
                    {!m.alt && m.kind === "image" ? " · no alt text" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
