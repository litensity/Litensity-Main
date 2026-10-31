"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminDb } from "@/lib/admin/data";
import { loadBuilderSections, type BuilderSection } from "@/lib/admin/pages";
import type { MediaThumb } from "@/lib/admin/data";
import { getKind, kindsForPage } from "@/lib/sections/kinds";

type Result = { ok: true; sections: BuilderSection[]; thumbs: Record<string, MediaThumb>; focusId?: string } | { ok: false; error: string };

const text = (max: number) => z.string().max(max).transform((v) => v.trim());
const optionalId = z.string().uuid().nullable();

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(300),
  body: text(4000),
  icon: text(40),
  href: text(500),
  meta: text(120),
  mediaId: optionalId,
});

const statSchema = z.object({
  id: z.string().uuid().optional(),
  label: text(120),
  source: z.enum(["manual", "stores_live", "cities", "states", "brands"]),
  value: text(40),
  suffix: text(20),
});

const sectionSchema = z.object({
  tone: z.enum(["paper", "cream", "ink", "ember", "brand"]).nullable(),
  layout: z.string().max(40).nullable(),
  eyebrow: text(200),
  heading: text(400),
  subheading: text(300),
  body: text(6000),
  ctaLabel: text(80),
  ctaHref: text(500),
  cta2Label: text(80),
  cta2Href: text(500),
  mediaId: optionalId,
  videoId: optionalId,
  items: z.array(itemSchema).max(60),
  stats: z.array(statSchema).max(12),
});

export type SectionInput = z.input<typeof sectionSchema>;

const nul = (v: string) => (v === "" ? null : v);

async function finish(pageKey: string, focusId?: string): Promise<Result> {
  revalidatePath("/", "layout");
  const { sections, thumbs } = await loadBuilderSections(pageKey);
  return { ok: true, sections, thumbs, focusId };
}

async function sectionRow(id: string) {
  const db = await adminDb();
  const { data } = await db.from("page_sections").select("*").eq("id", id).maybeSingle();
  return data as Record<string, unknown> | null;
}

const LINK = /^(\/|#|https?:\/\/|mailto:|tel:)/;

export async function saveSection(id: string, input: SectionInput): Promise<Result> {
  await requireAdmin();
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const row = await sectionRow(id);
  if (!row) return { ok: false, error: "This section no longer exists." };
  const kind = getKind(String(row.kind));
  if (!kind) return { ok: false, error: "Unknown section type." };

  for (const [label, href] of [
    [d.ctaLabel, d.ctaHref],
    [d.cta2Label, d.cta2Href],
  ] as const) {
    if (label && !href) return { ok: false, error: `The button “${label}” needs a link.` };
    if (href && !LINK.test(href)) return { ok: false, error: `Links must start with /, #, https://, mailto: or tel: (got “${href}”).` };
  }
  if (d.tone && kind.tones && !kind.tones.includes(d.tone)) return { ok: false, error: "That colour isn't available for this section." };
  if (d.layout && kind.layouts && !kind.layouts.some((l) => l.value === d.layout)) return { ok: false, error: "That layout isn't available for this section." };
  for (const item of d.items) if (item.href && !LINK.test(item.href)) return { ok: false, error: `Item link “${item.href}” is not valid.` };

  const db = await adminDb();
  const { error } = await db
    .from("page_sections")
    .update({
      tone: d.tone,
      layout: d.layout,
      eyebrow: nul(d.eyebrow),
      heading: nul(d.heading),
      subheading: nul(d.subheading),
      body: nul(d.body),
      cta_label: nul(d.ctaLabel),
      cta_href: nul(d.ctaHref),
      cta2_label: nul(d.cta2Label),
      cta2_href: nul(d.cta2Href),
      media_id: d.mediaId,
      video_media_id: d.videoId,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (kind.items) {
    const keep = d.items.filter((i) => i.id).map((i) => i.id!);
    let del = db.from("content_items").delete().eq("section_id", id);
    if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
    await del;
    for (const [index, item] of d.items.entries()) {
      if (!item.title && !item.mediaId) continue;
      const values = {
        section_id: id,
        title: item.title || "Untitled",
        body: nul(item.body),
        icon: nul(item.icon),
        href: nul(item.href),
        meta: nul(item.meta),
        media_id: item.mediaId,
        sort_order: (index + 1) * 10,
        status: "published" as const,
      };
      const res = item.id ? await db.from("content_items").update(values).eq("id", item.id).eq("section_id", id) : await db.from("content_items").insert(values);
      if (res.error) return { ok: false, error: res.error.message };
    }
  }

  if (kind.stats) {
    const keep = d.stats.filter((t) => t.id).map((t) => t.id!);
    let del = db.from("stats").delete().eq("section_id", id);
    if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
    await del;
    for (const [index, stat] of d.stats.entries()) {
      if (!stat.label) continue;
      const values = {
        section_id: id,
        scope: String(row.page_key),
        label: stat.label,
        source: stat.source,
        value: stat.source === "manual" ? nul(stat.value) : null,
        suffix: nul(stat.suffix),
        sort_order: (index + 1) * 10,
        status: "published" as const,
      };
      const res = stat.id ? await db.from("stats").update(values).eq("id", stat.id).eq("section_id", id) : await db.from("stats").insert(values);
      if (res.error) return { ok: false, error: res.error.message };
    }
  }

  return finish(String(row.page_key), id);
}

export async function setSectionVisibility(id: string, visible: boolean): Promise<Result> {
  await requireAdmin();
  const row = await sectionRow(id);
  if (!row) return { ok: false, error: "This section no longer exists." };
  const db = await adminDb();
  const { error } = await db.from("page_sections").update({ is_enabled: visible }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return finish(String(row.page_key), id);
}

export async function reorderSections(pageKey: string, ids: string[]): Promise<Result> {
  await requireAdmin();
  const parsed = z.array(z.string().uuid()).max(100).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Invalid order" };
  const db = await adminDb();
  // Pinned sections (heroes) always stay first.
  const { data } = await db.from("page_sections").select("id, kind").eq("page_key", pageKey);
  const pinned = ((data ?? []) as { id: string; kind: string }[]).filter((r) => getKind(r.kind)?.pinned).map((r) => r.id);
  const ordered = [...pinned, ...parsed.data.filter((id) => !pinned.includes(id))];
  const { error } = await db.rpc("reorder_page_sections", { p_page_key: pageKey, p_ids: ordered });
  if (error) return { ok: false, error: error.message };
  return finish(pageKey);
}

async function uniqueKey(pageKey: string, base: string): Promise<string> {
  const db = await adminDb();
  const { data } = await db.from("page_sections").select("section_key").eq("page_key", pageKey);
  const taken = new Set(((data ?? []) as { section_key: string }[]).map((r) => r.section_key));
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "section";
  if (!taken.has(slug)) return slug;
  for (let i = 2; i < 500; i++) if (!taken.has(`${slug}-${i}`)) return `${slug}-${i}`;
  return `${slug}-${Date.now()}`;
}

async function placeAfter(pageKey: string, newId: string, afterId: string | null) {
  const db = await adminDb();
  const { data } = await db.from("page_sections").select("id").eq("page_key", pageKey).order("sort_order").order("section_key");
  const ids = ((data ?? []) as { id: string }[]).map((r) => r.id).filter((id) => id !== newId);
  const at = afterId ? ids.indexOf(afterId) + 1 : ids.length;
  ids.splice(at <= 0 ? ids.length : at, 0, newId);
  await db.rpc("reorder_page_sections", { p_page_key: pageKey, p_ids: ids });
}

const STARTER: Record<string, Partial<Record<string, string>>> = {
  page_hero: { heading: "A new page hero" },
  text_media: { eyebrow: "Our story", heading: "A new story section", body: "Write a few sentences here." },
  statement: { eyebrow: "Statement", heading: "Say something bold." },
  quote: { eyebrow: "Vision", heading: "A line worth remembering." },
  cta_band: { eyebrow: "Next step", heading: "Ready when you are.", cta_label: "Get in touch", cta_href: "/contact" },
  image_banner: { eyebrow: "Spotlight", heading: "A picture worth a thousand words." },
  pillars: { eyebrow: "Why us", heading: "Three good reasons." },
  stats: { eyebrow: "In numbers", heading: "The numbers so far." },
  timeline: { eyebrow: "Timeline", heading: "How it happens." },
  faq: { eyebrow: "FAQ", heading: "Questions, answered." },
  link_rows: { eyebrow: "Explore", heading: "Where to next?" },
  image_gallery: { eyebrow: "Gallery", heading: "A closer look." },
};

export async function addSection(pageKey: string, kindKey: string, afterId: string | null): Promise<Result> {
  await requireAdmin();
  const kind = kindsForPage(pageKey).find((k) => k.key === kindKey);
  if (!kind) return { ok: false, error: "This section type can't be added to this page." };
  const db = await adminDb();
  if (kind.unique || kind.pinned) {
    const { count } = await db.from("page_sections").select("*", { count: "exact", head: true }).eq("page_key", pageKey).eq("kind", kindKey);
    if ((count ?? 0) > 0) return { ok: false, error: `This page already has a “${kind.label}” section.` };
  }
  const starter = STARTER[kindKey] ?? { heading: kind.label };
  const { data, error } = await db
    .from("page_sections")
    .insert({
      page_key: pageKey,
      section_key: await uniqueKey(pageKey, kind.label),
      kind: kindKey,
      tone: kind.tones?.[0] ?? null,
      layout: kind.layouts?.[0]?.value ?? null,
      is_enabled: true,
      status: "published",
      ...starter,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  const newId = String((data as { id: string }).id);
  if (kindKey === "stats") {
    await db.from("stats").insert([
      { section_id: newId, scope: pageKey, label: "Stores", source: "stores_live", sort_order: 10, status: "published" },
      { section_id: newId, scope: pageKey, label: "Cities", source: "cities", sort_order: 20, status: "published" },
    ]);
  }
  await placeAfter(pageKey, newId, kind.pinned ? null : afterId);
  return finish(pageKey, newId);
}

export async function duplicateSection(id: string): Promise<Result> {
  await requireAdmin();
  const row = await sectionRow(id);
  if (!row) return { ok: false, error: "This section no longer exists." };
  const kind = getKind(String(row.kind));
  if (kind?.pinned || kind?.unique) return { ok: false, error: `“${kind.label}” can only appear once on a page.` };
  const pageKey = String(row.page_key);
  const db = await adminDb();
  const copy = { ...row };
  delete copy.id;
  delete copy.updated_at;
  copy.section_key = await uniqueKey(pageKey, String(row.section_key));
  const { data, error } = await db.from("page_sections").insert(copy).select("id").single();
  if (error) return { ok: false, error: error.message };
  const newId = String((data as { id: string }).id);

  const [{ data: items }, { data: stats }] = await Promise.all([
    db.from("content_items").select("*").eq("section_id", id),
    db.from("stats").select("*").eq("section_id", id),
  ]);
  const strip = (r: Record<string, unknown>) => {
    const c: Record<string, unknown> = { ...r, section_id: newId };
    delete c.id;
    delete c.updated_at;
    return c;
  };
  if (items?.length) await db.from("content_items").insert((items as Record<string, unknown>[]).map(strip));
  if (stats?.length) await db.from("stats").insert((stats as Record<string, unknown>[]).map(strip));
  await placeAfter(pageKey, newId, id);
  return finish(pageKey, newId);
}

export async function deleteSection(id: string): Promise<Result> {
  await requireAdmin();
  const row = await sectionRow(id);
  if (!row) return { ok: false, error: "This section no longer exists." };
  if (getKind(String(row.kind))?.pinned) return { ok: false, error: "The page hero can't be deleted — hide it or edit it instead." };
  const db = await adminDb();
  const { error } = await db.from("page_sections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return finish(String(row.page_key));
}
