import type { MetadataRoute } from "next";
import { getBrands } from "@/lib/cms/brands";
import { getOpenJobs } from "@/lib/cms/people";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/brands", priority: 0.9 },
  { path: "/invest", priority: 0.9 },
  { path: "/stores", priority: 0.9 },
  { path: "/about", priority: 0.7 },
  { path: "/csr", priority: 0.6 },
  { path: "/careers", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

/** XML sitemap: static pages + every published brand and open role (new ones appear automatically). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, jobs] = await Promise.all([getBrands().catch(() => []), getOpenJobs().catch(() => [])]);
  const now = new Date();
  return [
    ...STATIC_ROUTES.map((r) => ({ url: absoluteUrl(r.path), lastModified: now, priority: r.priority })),
    ...brands.map((b) => ({ url: absoluteUrl(`/brands/${b.slug}`), lastModified: now, priority: 0.9 })),
    ...jobs.map((j) => ({ url: absoluteUrl(`/careers/${j.id}`), lastModified: now, priority: 0.5 })),
  ];
}
