import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/cms/media";
import type { Field, Option, Resource } from "./types";
import { allFields } from "./resources";

/**
 * The generic admin layer works across many tables chosen at runtime, so it uses
 * an untyped client. Safety comes from the registry: only registered tables and
 * columns are touched, and RLS (`is_admin()`) authorises every query.
 */
export async function adminDb(): Promise<SupabaseClient> {
  return (await createSessionClient()) as unknown as SupabaseClient;
}

export type Row = Record<string, unknown> & { id?: string };

export const PAGE_SIZE = 50;

export function pk(resource: Resource): string {
  return resource.primaryKey ?? "id";
}

export interface ListQuery {
  q?: string;
  page?: number;
  filters: Record<string, string>;
}

export async function listRecords(resource: Resource, query: ListQuery): Promise<{ rows: Row[]; count: number }> {
  const db = await adminDb();
  let req = db.from(resource.table).select("*", { count: "exact" });

  for (const [col, val] of Object.entries(resource.scope ?? {})) req = req.eq(col, val);
  for (const filter of resource.filters ?? []) {
    const value = query.filters[filter.name];
    if (!value) continue;
    req = value === "__none" ? req.is(filter.name, null) : req.eq(filter.name, value);
  }
  if (query.q && resource.search?.length) {
    const term = query.q.replace(/[%,()]/g, " ").trim();
    if (term) req = req.or(resource.search.map((c) => `${c}.ilike.%${term}%`).join(","));
  }
  for (const o of resource.orderBy ?? []) req = req.order(o.column, { ascending: o.ascending ?? true });
  if (resource.sortable && !resource.orderBy?.some((o) => o.column === "sort_order")) req = req.order("sort_order");

  const page = Math.max(1, query.page ?? 1);
  req = req.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, error, count } = await req;
  if (error) throw new Error(`${resource.table}: ${error.message}`);
  return { rows: (data ?? []) as Row[], count: count ?? 0 };
}

export async function getRecord(resource: Resource, id: string): Promise<Row | null> {
  const db = await adminDb();
  let req = db.from(resource.table).select("*").eq(pk(resource), id);
  for (const [col, val] of Object.entries(resource.scope ?? {})) req = req.eq(col, val);
  const { data, error } = await req.maybeSingle();
  if (error) throw new Error(`${resource.table}: ${error.message}`);
  if (!data) return null;
  const row = data as Row;
  if (allFields(resource).some((f) => f.type === "hours")) {
    const { data: hours } = await db.from("store_hours").select("*").eq("store_id", id).order("day_of_week");
    row.hours = hours ?? [];
  }
  return row;
}

export async function getSingleton(resource: Resource): Promise<Row | null> {
  const db = await adminDb();
  const { data } = await db.from(resource.table).select("*").limit(1).maybeSingle();
  return (data as Row) ?? null;
}

/** Options for every relation field (and relation filters) of a resource. */
export async function relationOptions(resource: Resource): Promise<Record<string, Option[]>> {
  const db = await adminDb();
  const relations = new Map<string, NonNullable<Field["relation"]>>();
  for (const f of allFields(resource)) if (f.relation) relations.set(f.name, f.relation);
  for (const f of resource.filters ?? []) if (f.relation) relations.set(f.name, f.relation);

  const out: Record<string, Option[]> = {};
  await Promise.all(
    [...relations.entries()].map(async ([name, rel]) => {
      const valueCol = rel.valueColumn ?? "id";
      const { data } = await db
        .from(rel.table)
        .select(`${valueCol}, ${rel.labelColumn}`)
        .order(rel.orderBy ?? rel.labelColumn)
        .limit(1000);
      out[name] = ((data ?? []) as unknown as Row[]).map((r) => ({ value: String(r[valueCol]), label: String(r[rel.labelColumn] ?? "—") }));
    }),
  );
  return out;
}

export interface MediaThumb {
  id: string;
  url: string | null;
  kind: string;
  mimeType: string;
  title: string | null;
  path: string;
}

/** Thumbnails for media ids referenced by a set of rows. Private files get no URL. */
export async function mediaThumbs(ids: (string | null | undefined)[]): Promise<Record<string, MediaThumb>> {
  const unique = [...new Set(ids.filter((v): v is string => typeof v === "string" && v.length > 0))];
  if (unique.length === 0) return {};
  const db = await adminDb();
  const { data } = await db.from("media").select("id, bucket, path, kind, mime_type, title").in("id", unique);
  const out: Record<string, MediaThumb> = {};
  for (const m of (data ?? []) as Row[]) {
    out[String(m.id)] = {
      id: String(m.id),
      url: m.bucket === "media" ? publicStorageUrl(String(m.bucket), String(m.path)) : null,
      kind: String(m.kind),
      mimeType: String(m.mime_type),
      title: (m.title as string) ?? null,
      path: String(m.path),
    };
  }
  return out;
}

export async function childRows(childResource: Resource, foreignKey: string, parentId: string): Promise<Row[]> {
  const db = await adminDb();
  let req = db.from(childResource.table).select("*").eq(foreignKey, parentId);
  for (const [col, val] of Object.entries(childResource.scope ?? {})) req = req.eq(col, val);
  for (const o of childResource.orderBy ?? []) if (o.column !== foreignKey) req = req.order(o.column, { ascending: o.ascending ?? true });
  const { data } = await req.limit(200);
  return (data ?? []) as Row[];
}

/** Text columns scanned for "[CLIENT CONTENT REQUIRED]" on the dashboard. */
const CONTENT_SCAN: { table: string; columns: string[]; label: string; resource: string }[] = [
  { table: "page_sections", columns: ["eyebrow", "heading", "body"], label: "Page sections", resource: "page-sections" },
  { table: "brands", columns: ["tagline", "positioning", "story_body", "differentiation", "format_summary", "investment_intro"], label: "Brands", resource: "brands" },
  { table: "content_items", columns: ["title", "body"], label: "Repeatable lists", resource: "lists" },
  { table: "products", columns: ["name", "description"], label: "Products", resource: "products" },
  { table: "product_categories", columns: ["description"], label: "Menu categories", resource: "product-categories" },
  { table: "investment_models", columns: ["name", "description"], label: "Investment models", resource: "investment-models" },
  { table: "faqs", columns: ["answer"], label: "FAQs", resource: "brand-faqs" },
  { table: "people", columns: ["designation", "background", "responsibility"], label: "People", resource: "founders" },
  { table: "milestones", columns: ["title", "body"], label: "Milestones", resource: "milestones" },
  { table: "site_settings", columns: ["positioning_line", "address"], label: "Global settings", resource: "settings" },
  { table: "contact_departments", columns: ["description"], label: "Departments", resource: "departments" },
  { table: "seo_metadata", columns: ["description"], label: "SEO", resource: "seo" },
  { table: "legal_documents", columns: ["body"], label: "Legal pages", resource: "legal" },
  { table: "stats", columns: ["label"], label: "Stats", resource: "stats" },
];

export async function missingContentReport(): Promise<{ label: string; resource: string; count: number }[]> {
  const db = await adminDb();
  const results = await Promise.all(
    CONTENT_SCAN.map(async (scan) => {
      const { count } = await db
        .from(scan.table)
        .select("*", { count: "exact", head: true })
        .or(scan.columns.map((c) => `${c}.ilike.%CLIENT CONTENT REQUIRED%`).join(","));
      return { label: scan.label, resource: scan.resource, count: count ?? 0 };
    }),
  );
  return results.filter((r) => r.count > 0);
}
