import type { Store, StoreHours } from "@/lib/cms/types";

/* Pure helpers shared by server and client store views. */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

export function formatRange(h: StoreHours): string {
  if (h.isClosed || !h.opensAt || !h.closesAt) return "Closed";
  return `${to12h(h.opensAt)} – ${to12h(h.closesAt)}`;
}

/** Collapses identical days: "Mon – Sun · 11am – 11pm". */
export function summariseHours(hours: StoreHours[]): { days: string; range: string }[] {
  if (hours.length === 0) return [];
  const groups: { start: number; end: number; range: string }[] = [];
  for (const h of hours) {
    const range = formatRange(h);
    const last = groups[groups.length - 1];
    if (last && last.range === range && last.end === h.day - 1) last.end = h.day;
    else groups.push({ start: h.day, end: h.day, range });
  }
  return groups.map((g) => ({
    days: g.start === g.end ? DAYS[g.start] : `${DAYS[g.start]} – ${DAYS[g.end]}`,
    range: g.range,
  }));
}

/** Current day (0 = Monday) and minutes in India Standard Time. */
export function nowInIndia(date = new Date()): { day: number; minutes: number } {
  const ist = new Date(date.getTime() + (330 + date.getTimezoneOffset()) * 60_000);
  return { day: (ist.getDay() + 6) % 7, minutes: ist.getHours() * 60 + ist.getMinutes() };
}

const mins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function isOpenNow(hours: StoreHours[], date = new Date()): boolean | null {
  if (hours.length === 0) return null;
  const { day, minutes } = nowInIndia(date);
  const today = hours.find((h) => h.day === day);
  const yesterday = hours.find((h) => h.day === (day + 6) % 7);
  // Handles past-midnight closing (e.g. 11:00 – 01:00).
  if (yesterday && !yesterday.isClosed && yesterday.opensAt && yesterday.closesAt && mins(yesterday.closesAt) < mins(yesterday.opensAt)) {
    if (minutes < mins(yesterday.closesAt)) return true;
  }
  if (!today || today.isClosed || !today.opensAt || !today.closesAt) return false;
  const open = mins(today.opensAt);
  const close = mins(today.closesAt);
  return close > open ? minutes >= open && minutes < close : minutes >= open;
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function directionsUrl(store: Pick<Store, "latitude" | "longitude" | "name">): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
}

export function storeMatchesQuery(store: Store, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (/^\d{1,6}$/.test(q)) return store.pincode.startsWith(q);
  return [store.name, store.locality, store.city, store.state, store.address, store.pincode]
    .filter(Boolean)
    .some((v) => v!.toLowerCase().includes(q));
}
