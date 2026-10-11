import "server-only";
import { cache } from "react";
import type { Tables } from "@/types/database";
import { getReader, unwrap } from "./reader";
import { toMedia } from "./media";
import type {
  BrandDetail,
  BrandSummary,
  Campaign,
  DeliveryLink,
  DownloadOffer,
  Faq,
  GalleryItem,
  InvestmentModel,
  ProductCategory,
} from "./types";

type MediaRow = Tables<"media">;
type BrandRow = Tables<"brands"> & {
  logo: MediaRow | null;
  logo_reverse: MediaRow | null;
  card: MediaRow | null;
  hero: MediaRow | null;
};

const BRAND_SELECT =
  "*, logo:media!brands_logo_media_id_fkey(*), logo_reverse:media!brands_logo_reverse_media_id_fkey(*), card:media!brands_card_media_id_fkey(*), hero:media!brands_hero_media_id_fkey(*)";

function toSummary(row: BrandRow): BrandSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ownership: row.ownership,
    tagline: row.tagline,
    positioning: row.positioning,
    category: row.category,
    formatSummary: row.format_summary,
    // Commercial figure: exposed only once Litensity has confirmed it in writing.
    ticketSizeLabel: row.ticket_size_confirmed ? row.ticket_size_label : null,
    colors: { primary: row.color_primary, ink: row.color_ink, surface: row.color_surface },
    typeface: row.typeface,
    heroObject: (row.hero_object as BrandSummary["heroObject"]) ?? "none",
    logo: toMedia(row.logo, `${row.name} logo`),
    logoReverse: toMedia(row.logo_reverse, `${row.name} logo`),
    card: toMedia(row.card),
    hero: toMedia(row.hero),
    // Brochure + brand enquiry are only meaningful when the investment block is on.
    features: {
      menuDownload: row.feature_menu_download,
      investment: row.feature_investment,
      brochureDownload: row.feature_investment && row.feature_brochure_download,
      investmentEnquiry: row.feature_investment && row.feature_investment_enquiry,
    },
  };
}

export const getBrands = cache(async (): Promise<BrandSummary[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("brands").select(BRAND_SELECT).in("status", statuses).order("sort_order"),
    "brands",
  );
  return (rows as unknown as BrandRow[]).map(toSummary);
});

export const getBrandBySlug = cache(async (slug: string): Promise<BrandDetail | null> => {
  const { db, statuses } = await getReader();
  const row = unwrap(
    await db
      .from("brands")
      .select(`${BRAND_SELECT}, video:media!brands_hero_video_media_id_fkey(*)`)
      .eq("slug", slug)
      .in("status", statuses)
      .maybeSingle(),
    `brand(${slug})`,
  ) as unknown as (BrandRow & { video: MediaRow | null }) | null;
  if (!row) return null;
  return {
    ...toSummary(row),
    storyHeading: row.story_heading,
    storyBody: row.story_body,
    differentiation: row.differentiation,
    heroVideo: toMedia(row.video),
    externalUrl: row.external_url_enabled ? row.external_url : null,
    investment: {
      heading: row.investment_heading,
      intro: row.investment_intro,
      field: row.investment_field,
      formatOptions: row.investment_format_options,
    },
  };
});

export const getBrandMenu = cache(async (brandId: string): Promise<ProductCategory[]> => {
  const { db, statuses } = await getReader();
  const [cats, products] = await Promise.all([
    db
      .from("product_categories")
      .select("*, media:media!product_categories_media_id_fkey(*)")
      .eq("brand_id", brandId)
      .in("status", statuses)
      .order("sort_order"),
    db
      .from("products")
      .select("*, media:media!products_media_id_fkey(*)")
      .eq("brand_id", brandId)
      .in("status", statuses)
      .order("sort_order"),
  ]);
  const categories = unwrap(cats, "product_categories");
  const items = unwrap(products, "products");
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    media: toMedia(c.media as MediaRow | null),
    products: items
      .filter((p) => p.category_id === c.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceLabel: p.price_label,
        isBestseller: p.is_bestseller,
        isVeg: p.is_veg,
        media: toMedia(p.media as MediaRow | null),
      })),
  }));
});

export const getBrandCampaigns = cache(async (brandId: string): Promise<Campaign[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("campaigns")
      .select("*, media:media!campaigns_media_id_fkey(*)")
      .eq("brand_id", brandId)
      .in("status", statuses)
      .order("sort_order"),
    "campaigns",
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    media: toMedia(r.media as MediaRow | null),
    cta: r.cta_label && r.cta_href ? { label: r.cta_label, href: r.cta_href } : null,
  }));
});

export const getGallery = cache(
  async (collection: "brand" | "csr" | "careers" | "about", brandId?: string): Promise<GalleryItem[]> => {
    const { db, statuses } = await getReader();
    let query = db
      .from("gallery_items")
      .select("*, media:media!gallery_items_media_id_fkey(*)")
      .eq("collection", collection)
      .in("status", statuses)
      .order("sort_order");
    if (brandId) query = query.eq("brand_id", brandId);
    const rows = unwrap(await query, `gallery(${collection})`);
    return rows.flatMap((r) => {
      const media = toMedia(r.media as MediaRow | null, r.caption);
      return media ? [{ id: r.id, media, caption: r.caption, tag: r.tag }] : [];
    });
  },
);

export const getDeliveryLinks = cache(async (brandId: string): Promise<DeliveryLink[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("delivery_links").select("platform, url").eq("brand_id", brandId).in("status", statuses).order("sort_order"),
    "delivery_links",
  );
  return rows;
});

/**
 * Download offers for a brand. File paths are never exposed — the file is released
 * by the OTP flow. Brochures are filtered by the brand feature switch as well.
 */
export const getBrandDownloads = cache(
  async (brandId: string, features: BrandSummary["features"]): Promise<DownloadOffer[]> => {
    const { db, statuses } = await getReader();
    const rows = unwrap(
      await db
        .from("downloads")
        .select("id, kind, title, description, requires_otp, file_media_id")
        .eq("brand_id", brandId)
        .in("status", statuses)
        .not("file_media_id", "is", null)
        .order("sort_order"),
      "downloads",
    );
    return rows
      .filter((r) => (r.kind === "menu" ? features.menuDownload : features.brochureDownload))
      .map((r) => ({ id: r.id, kind: r.kind, title: r.title, description: r.description, requiresOtp: r.requires_otp }));
  },
);

export const getInvestmentModels = cache(async (brandId: string): Promise<InvestmentModel[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("investment_models").select("*").eq("brand_id", brandId).in("status", statuses).order("sort_order"),
    "investment_models",
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    format: r.format,
    description: r.description,
    includes: r.includes,
    figures: r.figures_confirmed
      ? {
          investmentRange: r.investment_range,
          areaRequirement: r.area_requirement,
          paybackRange: r.payback_range,
          returnRange: r.return_range,
          assumptions: r.assumptions,
        }
      : null,
  }));
});

export const getFaqs = cache(
  async (scope: "brand_investment" | "invest" | "careers" | "general", brandId?: string): Promise<Faq[]> => {
    const { db, statuses } = await getReader();
    let query = db.from("faqs").select("id, question, answer").eq("scope", scope).in("status", statuses).order("sort_order");
    query = brandId ? query.eq("brand_id", brandId) : query.is("brand_id", null);
    return unwrap(await query, `faqs(${scope})`);
  },
);

/** Which download kinds are actually available per brand (published, with a file, feature on). */
export const getDownloadAvailability = cache(async (): Promise<Map<string, Set<"menu" | "brochure">>> => {
  const [{ db, statuses }, brands] = await Promise.all([getReader(), getBrands()]);
  const rows = unwrap(
    await db.from("downloads").select("brand_id, kind").in("status", statuses).not("file_media_id", "is", null),
    "downloads(availability)",
  );
  const out = new Map<string, Set<"menu" | "brochure">>();
  for (const b of brands) {
    const kinds = new Set(
      rows
        .filter((r) => r.brand_id === b.id)
        .map((r) => r.kind)
        .filter((k) => (k === "menu" ? b.features.menuDownload : b.features.brochureDownload)),
    );
    out.set(b.id, kinds);
  }
  return out;
});
