// Applies client-supplied brand palettes and the real store list to a Supabase project.
//   node --env-file=.env.local scripts/load-client-data.mjs
// Idempotent: stores are matched on (brand, name) and updated in place. Stores not in
// client-stores.json are archived (not deleted), so sample stores leave the site but stay recoverable.

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

/** Taken from each brand's own logo and website. */
const palettes = {
  bigguys: { color_primary: "#C3002D", color_ink: "#1A0A0D", color_surface: "#FFFFFF" },
  "belgian-waffle": { color_primary: "#FFC10E", color_ink: "#442619", color_surface: "#FFFCD5" },
  dcube: { color_primary: "#013240", color_ink: "#011C24", color_surface: "#FFEEBE" },
};

function fail(step, error) {
  console.error(`✖ ${step}: ${error.message}`);
  process.exit(1);
}

const { data: brands, error: brandErr } = await db.from("brands").select("id, slug");
if (brandErr) fail("brands", brandErr);
const brandId = Object.fromEntries(brands.map((b) => [b.slug, b.id]));

for (const [slug, colors] of Object.entries(palettes)) {
  if (!brandId[slug]) continue;
  const { error } = await db.from("brands").update(colors).eq("id", brandId[slug]);
  if (error) fail(`palette ${slug}`, error);
}
console.log("✔ brand palettes");

const { stores } = JSON.parse(fs.readFileSync(new URL("./client-stores.json", import.meta.url), "utf8"));
const { data: existing, error: existingErr } = await db.from("stores").select("id, brand_id, name");
if (existingErr) fail("stores", existingErr);

const kept = new Set();
for (const [i, s] of stores.entries()) {
  if (!brandId[s.brand]) fail("stores", new Error(`unknown brand "${s.brand}"`));
  const row = {
    brand_id: brandId[s.brand],
    name: s.name,
    address: s.address,
    locality: s.locality,
    city: s.city,
    state: s.state,
    pincode: s.pincode,
    latitude: s.latitude,
    longitude: s.longitude,
    store_status: s.status,
    is_archived: false,
    sort_order: i + 1,
  };
  const match = existing.find((e) => e.brand_id === row.brand_id && e.name === row.name);
  // Phone is client input still pending; never overwrite one entered in Admin.
  const { data, error } = match
    ? await db.from("stores").update(row).eq("id", match.id).select("id").single()
    : await db.from("stores").insert({ ...row, phone: "" }).select("id").single();
  if (error) fail(`store ${s.name}`, error);
  kept.add(data.id);
}
console.log(`✔ ${stores.length} stores`);

const stale = existing.filter((e) => !kept.has(e.id)).map((e) => e.id);
if (stale.length) {
  const { error } = await db.from("stores").update({ is_archived: true }).in("id", stale);
  if (error) fail("archive", error);
}
console.log(`✔ archived ${stale.length} other stores`);
