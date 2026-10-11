import "server-only";
import { cache } from "react";
import type { Tables } from "@/types/database";
import { getReader, unwrap } from "./reader";
import { toMedia } from "./media";
import type { CsrInitiative, Job, Milestone, Person } from "./types";

type MediaRow = Tables<"media">;

export const getPeople = cache(async (kind?: "founder" | "leader"): Promise<Person[]> => {
  const { db, statuses } = await getReader();
  let query = db
    .from("people")
    .select("*, photo:media!people_photo_media_id_fkey(*)")
    .in("status", statuses)
    .order("sort_order");
  if (kind) query = query.eq("kind", kind);
  const rows = unwrap(await query, "people");
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    name: r.name,
    designation: r.designation,
    background: r.background,
    responsibility: r.responsibility,
    bio: r.bio,
    linkedinUrl: r.linkedin_url,
    photo: toMedia(r.photo as MediaRow | null, r.name),
  }));
});

export const getMilestones = cache(async (): Promise<Milestone[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("milestones")
      .select("*, media:media!milestones_media_id_fkey(*)")
      .in("status", statuses)
      .order("sort_order"),
    "milestones",
  );
  return rows.map((r) => ({
    id: r.id,
    yearLabel: r.year_label,
    title: r.title,
    body: r.body,
    media: toMedia(r.media as MediaRow | null),
  }));
});

export const getCsrInitiatives = cache(async (): Promise<CsrInitiative[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("csr_initiatives")
      .select("*, gallery_items(*, media:media!gallery_items_media_id_fkey(*))")
      .in("status", statuses)
      .order("sort_order"),
    "csr_initiatives",
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    location: r.location,
    eventDate: r.event_date,
    description: r.description,
    photos: r.gallery_items
      .filter((g) => statuses.includes(g.status))
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((g) => {
        const media = toMedia(g.media as MediaRow | null, g.caption ?? r.title);
        return media ? [{ id: g.id, media, caption: g.caption, tag: g.tag }] : [];
      }),
  }));
});

/** One open, published role (draft too in preview) — null when closed, archived or unknown. */
export const getOpenJob = cache(async (id: string): Promise<Job | null> => {
  const jobs = await getOpenJobs();
  return jobs.find((j) => j.id === id) ?? null;
});

export const getOpenJobs = cache(async (): Promise<Job[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("jobs")
      .select("*, brand:brands!jobs_brand_id_fkey(name, slug)")
      .eq("is_open", true)
      .in("status", statuses)
      .order("sort_order")
      .order("created_at", { ascending: false }),
    "jobs",
  );
  return rows.map((r) => {
    const brand = r.brand as { name: string; slug: string } | null;
    return {
      id: r.id,
      title: r.title,
      brandName: brand?.name ?? null,
      brandSlug: brand?.slug ?? null,
      location: r.location,
      employmentType: r.employment_type,
      summary: r.summary,
      description: r.description,
      requirements: r.requirements,
    };
  });
});
