import "server-only";
import type { Metadata } from "next";
import { getSeo, getSiteSettings } from "@/lib/cms/site";
import { present } from "@/lib/content";

interface Fallback {
  title: string;
  description?: string | null;
  path: string;
  image?: { url: string; alt: string } | null;
}

/**
 * Builds page metadata from the CMS `seo_metadata` row for `routeKey`,
 * falling back to page content. One implementation for every route.
 */
export async function buildMetadata(routeKey: string, fallback: Fallback): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeo(routeKey), getSiteSettings()]);
  const siteName = present(settings.companyName) ?? "Litensity";

  const title = present(seo?.title) ?? fallback.title;
  const description = present(seo?.description) ?? present(fallback.description) ?? undefined;
  const ogImage = seo?.ogImage ?? fallback.image ?? settings.defaultOgImage;
  const canonical = seo?.canonicalPath ?? fallback.path;

  return {
    title: routeKey === "home" ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName,
      locale: "en_IN",
      url: canonical,
      title: present(seo?.ogTitle) ?? title,
      description: present(seo?.ogDescription) ?? description,
      images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: present(seo?.ogTitle) ?? title,
      description: present(seo?.ogDescription) ?? description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  };
}
