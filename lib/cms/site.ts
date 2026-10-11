import "server-only";
import { cache } from "react";
import type { Tables } from "@/types/database";
import { getReader, unwrap } from "./reader";
import { toMedia } from "./media";
import type {
  ContactDepartment,
  ContentItem,
  FormOptions,
  LegalDocument,
  Navigation,
  SectionMap,
  SeoEntry,
  SiteSettings,
  SocialLink,
} from "./types";

type MediaRow = Tables<"media">;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const { db } = await getReader();
  const row = unwrap(
    await db
      .from("site_settings")
      .select("*, logo:media!site_settings_logo_media_id_fkey(*), og:media!site_settings_default_og_media_id_fkey(*)")
      .eq("id", 1)
      .maybeSingle(),
    "site_settings",
  );
  if (!row) throw new Error("[cms] site_settings row is missing — run the seed or create it in Admin → Settings.");
  return {
    companyName: row.company_name,
    legalName: row.legal_name,
    positioningLine: row.positioning_line,
    address: row.address,
    mapUrl: row.map_url,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    email: row.email,
    whatsappNumber: row.whatsapp_number,
    whatsappMessage: row.whatsapp_message,
    enquire: { label: row.enquire_label, href: row.enquire_href },
    footerStatement: row.footer_statement,
    newsletterEnabled: row.newsletter_enabled,
    newsletterHeading: row.newsletter_heading,
    analyticsId: row.analytics_measurement_id,
    logo: toMedia(row.logo as MediaRow | null),
    defaultOgImage: toMedia(row.og as MediaRow | null),
  };
});

export const getNavigation = cache(async (): Promise<Navigation> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("navigation_items").select("location, label, href").in("status", statuses).order("sort_order"),
    "navigation_items",
  );
  const pick = (location: string) => rows.filter((r) => r.location === location).map(({ label, href }) => ({ label, href }));
  return { header: pick("header"), footerExplore: pick("footer_explore"), footerLegal: pick("footer_legal") };
});

export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("social_links").select("platform, url, brand_id").in("status", statuses).order("sort_order"),
    "social_links",
  );
  return rows.map((r) => ({ platform: r.platform, url: r.url, brandId: r.brand_id }));
});

export const getSections = cache(async (pageKey: string): Promise<SectionMap> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("page_sections")
      .select(
        "*, media:media!page_sections_media_id_fkey(*), video:media!page_sections_video_media_id_fkey(*)",
      )
      .eq("page_key", pageKey)
      .eq("is_enabled", true)
      .in("status", statuses),
    `page_sections(${pageKey})`,
  );
  const map: SectionMap = {};
  for (const r of rows) {
    map[r.section_key] = {
      key: r.section_key,
      eyebrow: r.eyebrow,
      heading: r.heading,
      subheading: r.subheading,
      body: r.body,
      cta: r.cta_label && r.cta_href ? { label: r.cta_label, href: r.cta_href } : null,
      cta2: r.cta2_label && r.cta2_href ? { label: r.cta2_label, href: r.cta2_href } : null,
      media: toMedia(r.media as MediaRow | null),
      video: toMedia(r.video as MediaRow | null),
    };
  }
  return map;
});

export const getContentList = cache(async (listKey: string, brandId?: string): Promise<ContentItem[]> => {
  const { db, statuses } = await getReader();
  let query = db
    .from("content_items")
    .select("*, media:media!content_items_media_id_fkey(*)")
    .eq("list_key", listKey)
    .in("status", statuses)
    .order("sort_order");
  query = brandId ? query.eq("brand_id", brandId) : query.is("brand_id", null);
  const rows = unwrap(await query, `content_items(${listKey})`);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    meta: r.meta,
    icon: r.icon,
    href: r.href,
    media: toMedia(r.media as MediaRow | null),
  }));
});

export const getSeo = cache(async (routeKey: string): Promise<SeoEntry | null> => {
  const { db } = await getReader();
  const row = unwrap(
    await db
      .from("seo_metadata")
      .select("*, og:media!seo_metadata_og_media_id_fkey(*)")
      .eq("route_key", routeKey)
      .maybeSingle(),
    `seo_metadata(${routeKey})`,
  );
  if (!row) return null;
  return {
    title: row.title,
    description: row.description,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImage: toMedia(row.og as MediaRow | null),
    canonicalPath: row.canonical_path,
    noindex: row.noindex,
  };
});

export const getContactDepartments = cache(async (): Promise<ContactDepartment[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("contact_departments").select("*").in("status", statuses).order("sort_order"),
    "contact_departments",
  );
  return rows.map((r) => ({ id: r.id, name: r.name, description: r.description, email: r.email, phone: r.phone }));
});

export const getLegalDocument = cache(async (slug: string): Promise<LegalDocument | null> => {
  const { db, statuses } = await getReader();
  const row = unwrap(
    await db.from("legal_documents").select("*").eq("slug", slug).in("status", statuses).maybeSingle(),
    `legal_documents(${slug})`,
  );
  return row ? { slug: row.slug, title: row.title, body: row.body, updatedAt: row.updated_at } : null;
});

export const getFormOptions = cache(async (formKey: string): Promise<FormOptions> => {
  const { db } = await getReader();
  const row = unwrap(await db.from("form_options").select("*").eq("form_key", formKey).maybeSingle(), `form_options(${formKey})`);
  return {
    budgetOptions: row?.budget_options ?? [],
    timelineOptions: row?.timeline_options ?? [],
    ticketSizeOptions: row?.ticket_size_options ?? [],
    enquiryTypes: row?.enquiry_types ?? [],
    successMessage: row?.success_message ?? null,
    enabled: row?.is_enabled ?? true,
    consentLabel: row?.consent_label ?? null,
  };
});
