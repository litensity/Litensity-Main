import "server-only";
import { adminDb, mediaThumbs, type MediaThumb } from "./data";

/* Data shapes for the admin page builder (plain JSON, safe to pass to the client). */

export interface BuilderItem {
  id?: string;
  title: string;
  body: string;
  icon: string;
  href: string;
  meta: string;
  mediaId: string | null;
}

export interface BuilderStat {
  id?: string;
  label: string;
  source: "manual" | "stores_live" | "cities" | "states" | "brands";
  value: string;
  suffix: string;
}

export interface BuilderSection {
  id: string;
  key: string;
  kind: string;
  visible: boolean;
  tone: string | null;
  layout: string | null;
  eyebrow: string;
  heading: string;
  subheading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string;
  cta2Href: string;
  mediaId: string | null;
  videoId: string | null;
  items: BuilderItem[];
  stats: BuilderStat[];
  updatedAt: string;
}

export interface BuilderPage {
  key: string;
  name: string;
  sections: BuilderSection[];
  thumbs: Record<string, MediaThumb>;
}

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export async function loadBuilderSections(pageKey: string): Promise<{ sections: BuilderSection[]; thumbs: Record<string, MediaThumb> }> {
  const db = await adminDb();
  const { data: rows, error } = await db.from("page_sections").select("*").eq("page_key", pageKey).order("sort_order").order("section_key");
  if (error) throw new Error(error.message);
  const list = (rows ?? []) as Record<string, unknown>[];
  const ids = list.map((r) => String(r.id));
  const [{ data: items }, { data: stats }] = await Promise.all([
    ids.length ? db.from("content_items").select("*").in("section_id", ids).order("sort_order") : Promise.resolve({ data: [] }),
    ids.length ? db.from("stats").select("*").in("section_id", ids).order("sort_order") : Promise.resolve({ data: [] }),
  ]);
  const itemRows = (items ?? []) as Record<string, unknown>[];
  const statRows = (stats ?? []) as Record<string, unknown>[];

  const sections: BuilderSection[] = list.map((r) => ({
    id: String(r.id),
    key: String(r.section_key),
    kind: String(r.kind),
    visible: Boolean(r.is_enabled),
    tone: (r.tone as string) ?? null,
    layout: (r.layout as string) ?? null,
    eyebrow: s(r.eyebrow),
    heading: s(r.heading),
    subheading: s(r.subheading),
    body: s(r.body),
    ctaLabel: s(r.cta_label),
    ctaHref: s(r.cta_href),
    cta2Label: s(r.cta2_label),
    cta2Href: s(r.cta2_href),
    mediaId: (r.media_id as string) ?? null,
    videoId: (r.video_media_id as string) ?? null,
    updatedAt: s(r.updated_at),
    items: itemRows
      .filter((i) => i.section_id === r.id)
      .map((i) => ({
        id: String(i.id),
        title: s(i.title),
        body: s(i.body),
        icon: s(i.icon),
        href: s(i.href),
        meta: s(i.meta),
        mediaId: (i.media_id as string) ?? null,
      })),
    stats: statRows
      .filter((t) => t.section_id === r.id)
      .map((t) => ({
        id: String(t.id),
        label: s(t.label),
        source: t.source as BuilderStat["source"],
        value: s(t.value),
        suffix: s(t.suffix),
      })),
  }));

  const thumbs = await mediaThumbs([
    ...sections.flatMap((x) => [x.mediaId, x.videoId]),
    ...sections.flatMap((x) => x.items.map((i) => i.mediaId)),
  ]);
  return { sections, thumbs };
}

export async function loadPages(): Promise<{ key: string; name: string; total: number; hidden: number; updatedAt: string | null }[]> {
  const db = await adminDb();
  const [{ data: pages }, { data: sections }] = await Promise.all([
    db.from("pages").select("key, name"),
    db.from("page_sections").select("page_key, is_enabled, updated_at"),
  ]);
  const rows = (sections ?? []) as { page_key: string; is_enabled: boolean; updated_at: string }[];
  return ((pages ?? []) as { key: string; name: string }[]).map((p) => {
    const own = rows.filter((r) => r.page_key === p.key);
    const updatedAt = own.map((r) => r.updated_at).sort().pop() ?? null;
    return { key: p.key, name: p.name, total: own.length, hidden: own.filter((r) => !r.is_enabled).length, updatedAt };
  });
}
