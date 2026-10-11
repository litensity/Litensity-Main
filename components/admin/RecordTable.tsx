import Link from "next/link";
import type { Option, Resource } from "@/lib/admin/types";
import { pk, type MediaThumb, type Row } from "@/lib/admin/data";
import { moveRecord } from "@/app/admin/actions";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Cell({
  value,
  format,
  options,
  thumb,
}: {
  value: unknown;
  format?: string;
  options?: Option[];
  thumb?: MediaThumb;
}) {
  if (format === "status") {
    if (!value) return <span className="admin-muted">—</span>;
    return <span className={`a-badge a-badge-${String(value)}`}>{String(value)}</span>;
  }
  if (format === "boolean") return <span className={`a-badge a-badge-${value ? "yes" : "no"}`}>{value ? "Yes" : "No"}</span>;
  if (format === "color") return <span className="a-swatch" style={{ background: String(value ?? "#fff") }} title={String(value ?? "")} />;
  if (format === "date") return <>{value ? dateFormat.format(new Date(String(value))) : "—"}</>;
  if (format === "relation") return <>{options?.find((o) => o.value === value)?.label ?? (value ? "…" : "—")}</>;
  if (format === "media") {
    if (!thumb) return <span className="a-thumb" aria-hidden="true" />;
    // eslint-disable-next-line @next/next/no-img-element
    if (thumb.url && thumb.kind === "image") return <img src={thumb.url} alt="" className="a-thumb" loading="lazy" />;
    return <span className="a-thumb a-thumb-doc">{thumb.kind === "video" ? "VID" : "PDF"}</span>;
  }
  if (Array.isArray(value)) return <>{value.join(", ")}</>;
  if (value === null || value === undefined || value === "") return <span className="admin-muted">—</span>;
  return <>{String(value)}</>;
}

export function RecordTable({
  resource,
  rows,
  options,
  thumbs,
  returnTo,
  compact,
}: {
  resource: Resource;
  rows: Row[];
  options: Record<string, Option[]>;
  thumbs: Record<string, MediaThumb>;
  returnTo: string;
  compact?: boolean;
}) {
  if (rows.length === 0) return <p className="a-empty">Nothing here yet.</p>;
  const key = pk(resource);
  const mainCol = resource.list.find((c) => c.format !== "media")?.name;

  return (
    <div className="a-table-wrap">
      <table className="a-table">
        <thead>
          <tr>
            {resource.list.map((c) => (
              <th key={c.name} scope="col">
                {c.label || <span className="sr-only">Image</span>}
              </th>
            ))}
            {resource.sortable && !compact && <th scope="col">Order</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = String(row[key]);
            const href = `/admin/r/${resource.key}/${encodeURIComponent(id)}`;
            return (
              <tr key={id}>
                {resource.list.map((c) => (
                  <td key={c.name} className={c.name === mainCol ? "a-cell-main" : undefined}>
                    {c.name === mainCol ? (
                      <Link href={href}>
                        <Cell value={row[c.name]} format={c.format} options={options[c.name]} />
                      </Link>
                    ) : (
                      <Cell value={row[c.name]} format={c.format} options={options[c.name]} thumb={thumbs[String(row[c.name])]} />
                    )}
                  </td>
                ))}
                {resource.sortable && !compact && (
                  <td>
                    <span className="a-move">
                      <form action={moveRecord.bind(null, resource.key, id, "up", returnTo)}>
                        <button type="submit" aria-label="Move up" title="Move up">
                          ↑
                        </button>
                      </form>
                      <form action={moveRecord.bind(null, resource.key, id, "down", returnTo)}>
                        <button type="submit" aria-label="Move down" title="Move down">
                          ↓
                        </button>
                      </form>
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
