import "server-only";
import { cache } from "react";
import type { Tables } from "@/types/database";
import { getReader, unwrap } from "./reader";
import { toMedia } from "./media";
import { resolveStats } from "./stores";
import type { ContentItem, Section, StatItem } from "./types";
import type { Tone } from "@/lib/sections/kinds";

type MediaRow = Tables<"media">;

export interface PageSection extends Section {
  id: string;
  kind: string;
  tone: Tone | null;
  layout: string | null;
  items: ContentItem[];
  stats: StatItem[];
  /** 1-based position among visible sections (for eyebrow numbering). */
  position: number;
}

/**
 * A page's visible sections in editor-defined order, with their items and stats.
 * Hidden sections never leave the database.
 */
export const getPageSections = cache(async (pageKey: string): Promise<PageSection[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("page_sections")
      .select("*, media:media!page_sections_media_id_fkey(*), video:media!page_sections_video_media_id_fkey(*)")
      .eq("page_key", pageKey)
      .eq("is_enabled", true)
      .in("status", statuses)
      .order("sort_order")
      .order("section_key"),
    `page_sections(${pageKey})`,
  );
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const [itemRows, statRows] = await Promise.all([
    db
      .from("content_items")
      .select("*, media:media!content_items_media_id_fkey(*)")
      .in("section_id", ids)
      .in("status", statuses)
      .order("sort_order"),
    db.from("stats").select("*").in("section_id", ids).in("status", statuses).order("sort_order"),
  ]);
  const items = unwrap(itemRows, "section items");
  const stats = unwrap(statRows, "section stats");

  return Promise.all(
    rows.map(async (r, i) => ({
      id: r.id,
      key: r.section_key,
      kind: r.kind,
      tone: (r.tone as Tone | null) ?? null,
      layout: r.layout,
      position: i + 1,
      eyebrow: r.eyebrow,
      heading: r.heading,
      subheading: r.subheading,
      body: r.body,
      cta: r.cta_label && r.cta_href ? { label: r.cta_label, href: r.cta_href } : null,
      cta2: r.cta2_label && r.cta2_href ? { label: r.cta2_label, href: r.cta2_href } : null,
      media: toMedia(r.media as MediaRow | null),
      video: toMedia(r.video as MediaRow | null),
      items: items
        .filter((it) => it.section_id === r.id)
        .map((it) => ({
          id: it.id,
          title: it.title,
          body: it.body,
          meta: it.meta,
          icon: it.icon,
          href: it.href,
          media: toMedia(it.media as MediaRow | null, it.title),
        })),
      stats: await resolveStats(stats.filter((s) => s.section_id === r.id)),
    })),
  );
});
