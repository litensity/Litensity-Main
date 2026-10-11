import "server-only";
import { cache } from "react";
import type { Tables } from "@/types/database";
import { getReader, unwrap } from "./reader";
import { toMedia } from "./media";
import type { StatItem, Store } from "./types";

type StoreRow = Tables<"stores"> & {
  photo: Tables<"media"> | null;
  brand: Pick<Tables<"brands">, "id" | "slug" | "name" | "color_primary" | "status"> | null;
  store_hours: Tables<"store_hours">[];
  store_order_links: Tables<"store_order_links">[];
};

/**
 * The Store Master. Every public surface (map, lists, brand pages, counts, stats)
 * reads stores through this one function.
 */
export const getStores = cache(async (): Promise<Store[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db
      .from("stores")
      .select(
        "*, photo:media!stores_photo_media_id_fkey(*), brand:brands!stores_brand_id_fkey(id, slug, name, color_primary, status), store_hours(*), store_order_links(*)",
      )
      .eq("is_archived", false)
      .order("state")
      .order("city")
      .order("sort_order"),
    "stores",
  ) as unknown as StoreRow[];

  return rows
    .filter((r) => r.brand && statuses.includes(r.brand.status))
    .map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      locality: r.locality,
      city: r.city,
      state: r.state,
      pincode: r.pincode,
      latitude: r.latitude,
      longitude: r.longitude,
      phone: r.phone,
      status: r.store_status,
      hoursNote: r.hours_note,
      hours: [...r.store_hours]
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((h) => ({
          day: h.day_of_week,
          opensAt: h.opens_at?.slice(0, 5) ?? null,
          closesAt: h.closes_at?.slice(0, 5) ?? null,
          isClosed: h.is_closed,
        })),
      orderLinks: [...r.store_order_links].sort((a, b) => a.sort_order - b.sort_order).map(({ platform, url }) => ({ platform, url })),
      photo: toMedia(r.photo, `${r.name} storefront`),
      brand: { id: r.brand!.id, slug: r.brand!.slug, name: r.brand!.name, color: r.brand!.color_primary },
    }));
});

export async function getStoresForBrand(brandId: string): Promise<Store[]> {
  return (await getStores()).filter((s) => s.brand.id === brandId);
}

export interface Footprint {
  storesLive: number;
  cities: number;
  states: number;
}

export function footprintOf(stores: Store[]): Footprint {
  const live = stores.filter((s) => s.status === "live");
  return {
    storesLive: live.length,
    cities: new Set(live.map((s) => `${s.state}|${s.city}`.toLowerCase())).size,
    states: new Set(live.map((s) => s.state.toLowerCase())).size,
  };
}

/**
 * Highlights for a scope. Rows with a computed `source` take their value from the
 * Store Master, so counts can never drift from the stores table. Manual rows with
 * no value stay null and are not rendered publicly.
 */
type StatRowDb = Tables<"stats">;

/** Resolves stat rows: computed sources read the Store Master, manual rows keep their value. */
export async function resolveStats(rows: StatRowDb[], brandId?: string): Promise<StatItem[]> {
  if (rows.length === 0) return [];
  const { db, statuses } = await getReader();
  const needsStores = rows.some((r) => r.source !== "manual");
  const stores = needsStores ? await getStores() : [];
  const scoped = brandId ? stores.filter((s) => s.brand.id === brandId) : stores;
  const footprint = footprintOf(scoped);
  const brandCount = rows.some((r) => r.source === "brands")
    ? ((await db.from("brands").select("id", { count: "exact", head: true }).in("status", statuses)).count ?? 0)
    : 0;

  return rows.map((r) => {
    const computed: Record<string, number> = {
      stores_live: footprint.storesLive,
      cities: footprint.cities,
      states: footprint.states,
      brands: brandCount,
    };
    const raw = r.source === "manual" ? r.value : computed[r.source];
    // A computed zero means the Store Master is empty — treat as "not yet available".
    const value = raw === undefined || raw === null || raw === 0 || raw === "" ? null : String(raw);
    return { id: r.id, label: r.label, value, suffix: r.suffix, note: r.note };
  });
}

/** Brand-page stats (one set per brand). */
export const getBrandStats = cache(async (brandId: string): Promise<StatItem[]> => {
  const { db, statuses } = await getReader();
  const rows = unwrap(
    await db.from("stats").select("*").eq("scope", "brand").eq("brand_id", brandId).in("status", statuses).order("sort_order"),
    "stats(brand)",
  );
  return resolveStats(rows, brandId);
});
