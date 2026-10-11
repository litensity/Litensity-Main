import Link from "next/link";
import type { Resource } from "@/lib/admin/types";
import { allFields, canDeleteRecords, getResource } from "@/lib/admin/resources";
import { childRows, mediaThumbs, pk, relationOptions, type Row } from "@/lib/admin/data";
import { deleteRecord } from "@/app/admin/actions";
import { RecordForm } from "./RecordForm";
import { RecordTable } from "./RecordTable";
import { ConfirmButton } from "./ConfirmButton";
import { Notices } from "./Notices";

type SP = Record<string, string | string[] | undefined>;

/** Generic create/edit screen for any registered resource. */
export async function RecordEditor({ resource, row, id, searchParams }: { resource: Resource; row: Row | null; id: string | null; searchParams: SP }) {
  const fields = allFields(resource);
  const [options, thumbs] = await Promise.all([
    relationOptions(resource),
    mediaThumbs(fields.filter((f) => f.type === "media").map((f) => row?.[f.name] as string)),
  ]);

  // Prefill new records from list filters (e.g. ?brand_id=… when adding a product to a brand).
  const initial: Row = { ...(row ?? {}) };
  if (!row) {
    for (const f of fields) {
      const fromQuery = searchParams[f.name];
      if (typeof fromQuery === "string") initial[f.name] = fromQuery;
      else if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue;
    }
  }

  const previewPath = row && resource.preview ? resource.preview(row) : null;
  const title = row ? String(row[resource.titleField] ?? resource.singular) : `New ${resource.singular.toLowerCase()}`;
  const returnTo = typeof searchParams.return === "string" && searchParams.return.startsWith("/admin/") ? searchParams.return : "";

  const children = row
    ? await Promise.all(
        (resource.children ?? []).map(async (child) => {
          const childResource = getResource(child.resource)!;
          const [rows, childOptions] = await Promise.all([childRows(childResource, child.foreignKey, String(row[pk(resource)])), relationOptions(childResource)]);
          const mediaCols = childResource.list.filter((c) => c.format === "media").map((c) => c.name);
          const childThumbs = await mediaThumbs(rows.flatMap((r) => mediaCols.map((c) => r[c] as string)));
          return { child, childResource, rows, childOptions, childThumbs };
        }),
      )
    : [];

  const selfPath = `/admin/r/${resource.key}${resource.singleton ? "" : `/${encodeURIComponent(id ?? "new")}`}`;

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> /{" "}
            {resource.singleton ? <span>{resource.group}</span> : <Link href={`/admin/r/${resource.key}`}>{resource.label}</Link>}
          </p>
          <h1>{title.replace("[CLIENT CONTENT REQUIRED] ", "")}</h1>
          {resource.singleton && resource.description && <p>{resource.description}</p>}
        </div>
        <div className="admin-actions">
          {previewPath && (
            <a className="a-btn" href={`/api/preview?path=${encodeURIComponent(previewPath)}`} target="_blank" rel="noopener noreferrer">
              Preview incl. drafts ↗
            </a>
          )}
          {row && canDeleteRecords(resource) && (
            <form action={deleteRecord.bind(null, resource.key, String(row[pk(resource)]), returnTo || undefined)}>
              <ConfirmButton message={`Delete this ${resource.singular.toLowerCase()}? This cannot be undone.`} className="a-btn a-btn-danger">
                Delete
              </ConfirmButton>
            </form>
          )}
        </div>
      </header>

      <Notices searchParams={searchParams} />

      <RecordForm
        resourceKey={resource.key}
        id={id}
        groups={resource.groups}
        values={initial}
        options={options}
        thumbs={thumbs}
        readOnly={Boolean(resource.readOnly)}
        isNew={!row}
        returnTo={returnTo}
        extra={
          resource.key === "leads" && row ? (
            <section className="a-panel">
              <div className="a-panel-head">
                <h2>Submitted data</h2>
              </div>
              <div className="a-panel-body">
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{JSON.stringify(row.payload, null, 2)}</pre>
              </div>
            </section>
          ) : null
        }
      />

      {children.length > 2 ? (
        <section className="a-panel" style={{ marginTop: "1rem" }}>
          <div className="a-panel-head">
            <div>
              <h2>Related content</h2>
              <p>Everything that belongs to this {resource.singular.toLowerCase()}.</p>
            </div>
          </div>
          <div className="a-panel-body a-children">
            {children.map(({ child, childResource, rows }) => (
              <div key={child.resource} className="a-child">
                <Link href={`/admin/r/${childResource.key}?${child.foreignKey}=${encodeURIComponent(id!)}`} className="a-link">
                  {child.title}
                </Link>
                <span className="a-child-count">{rows.length}</span>
                <span className="admin-actions">
                  <Link className="a-btn a-btn-sm" href={`/admin/r/${childResource.key}?${child.foreignKey}=${encodeURIComponent(id!)}`}>
                    Manage
                  </Link>
                  <Link
                    className="a-btn a-btn-sm"
                    href={`/admin/r/${childResource.key}/new?${child.foreignKey}=${encodeURIComponent(id!)}&return=${encodeURIComponent(selfPath)}`}
                  >
                    + Add
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        children.map(({ child, childResource, rows, childOptions, childThumbs }) => (
          <section key={child.resource} className="a-panel" style={{ marginTop: "1rem" }}>
            <div className="a-panel-head">
              <div>
                <h2>{child.title}</h2>
                <p>
                  {rows.length} {rows.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="admin-actions">
                <Link
                  className="a-btn a-btn-sm a-btn-primary"
                  href={`/admin/r/${childResource.key}/new?${child.foreignKey}=${encodeURIComponent(id!)}&return=${encodeURIComponent(selfPath)}`}
                >
                  Add
                </Link>
              </div>
            </div>
            <RecordTable resource={childResource} rows={rows} options={childOptions} thumbs={childThumbs} returnTo={selfPath} compact />
          </section>
        ))
      )}
    </>
  );
}
