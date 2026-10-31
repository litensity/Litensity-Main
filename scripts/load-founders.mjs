// Loads the real founders (copy and links from www.dcubedessertscafe.com; Naveen's portrait from the
// client's "Mugshots founders" Drive folder, Niranjan's from scripts/founders/) into a Supabase project.
//   node --env-file=.env.local scripts/load-founders.mjs
// Idempotent: founders are matched on name and updated in place; portraits are cropped to 4:5 and
// stored once under founders/<slug>.jpg. Other founder rows (placeholders) are archived, not deleted.
// Instagram links need migration 20261012000100_people_instagram; until it is pushed they are skipped.

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const wix = (file) => `https://static.wixstatic.com/media/3aa10e_${file}`;
const drive = (id) => `https://drive.google.com/uc?export=download&id=${id}`;

const founders = [
  {
    slug: "naveen-gorantla",
    name: "Naveen Gorantla",
    designation: "Founder, CEO",
    background:
      "With 17 years of experience working in the USA and Brazil, he applies technology and solution architecture to improve efficiency and innovation in the food & beverage industry, driven by a passion for food.",
    linkedin_url: "https://www.linkedin.com/in/naveen-babu-gorantla-b47ba921/",
    instagram_url: "https://www.instagram.com/naveenbabu_gorantla",
    // DSC06408.JPG — full-length shot, so frame head to waist.
    photo: drive("1G2fdIdqYIlxLRY3ILk79FfTCH-h4scUp"),
    photoPath: "founders/naveen-gorantla-mugshot.jpg",
    frame: { top: 0.03, width: 0.85 },
  },
  {
    slug: "niranjan-bandla",
    name: "Niranjan Bandla",
    designation: "Founder, CTO",
    background:
      "Brings 17+ years of global IT experience, having worked across the USA, Mexico, and South Korea, and combines a passion for food with technology to drive innovation in the food & beverage industry.",
    linkedin_url: "https://www.linkedin.com/in/niranjan-babu-bandla-9a38791b8/",
    instagram_url: "https://www.instagram.com/niranjanbandla",
    // Studio portrait supplied by the client (2026-10-31), kept in scripts/founders/.
    file: "founders/niranjan-bandla.png",
    photoPath: "founders/niranjan-bandla-portrait.jpg",
    frame: { top: 0.02, width: 1 },
  },
  {
    slug: "raj-vinnakota",
    name: "Dr. Raj Vinnakota",
    designation: "Founder, CSO",
    background:
      "Based in the USA, he brings deep engineering and science expertise, blending technology with a passion for food to lead innovation in the food & beverage industry.",
    linkedin_url: "https://www.linkedin.com/in/rajkvinnakota/",
    instagram_url: "https://www.instagram.com/vinnakota5279",
    photo: wix("4c69b0a1581a49a38a7f56dc93cb3653~mv2.png"),
    crop: "attention",
  },
  {
    slug: "vasu-v",
    name: "Vasu V",
    designation: "Co-Founder, Operations",
    background:
      "Seasoned QSR leader with 20+ years of experience scaling startup concepts into 85+ profitable stores across India & UAE. Expert in end-to-end brand building, multi-city operations, dark kitchens, and ROI-driven growth strategies.",
    linkedin_url: "https://www.linkedin.com/in/vasu-v-83b34534/",
    instagram_url: "https://www.instagram.com/vasu1033",
    photo: wix("33f9735ee1f542639bd10d890574b68d~mv2.png"),
    crop: "attention",
  },
];

function fail(step, error) {
  console.error(`✖ ${step}: ${error.message}`);
  process.exit(1);
}

async function portrait(f) {
  const path = f.photoPath ?? `founders/${f.slug}.jpg`;
  const { data: found } = await db.from("media").select("id").eq("bucket", "media").eq("path", path).maybeSingle();
  if (found) return found.id;
  let src;
  if (f.file) src = fs.readFileSync(new URL(`./${f.file}`, import.meta.url));
  else {
    const res = await fetch(f.photo);
    if (!res.ok) fail(`download ${f.name}`, new Error(`${res.status}`));
    src = Buffer.from(await res.arrayBuffer());
  }
  let img = sharp(await sharp(src).rotate().toBuffer());
  if (f.frame) {
    // Centred 4:5 window: `width` is a fraction of the photo width, `top` a fraction of its height.
    const { width: W, height: H } = await img.metadata();
    const width = Math.round(W * f.frame.width);
    const top = Math.round(H * f.frame.top);
    img = img.extract({ left: Math.round((W - width) / 2), top, width, height: Math.min(Math.round(width * 1.25), H - top) });
  }
  const buf = await img
    .resize({ width: 1200, height: 1500, fit: "cover", position: f.crop ?? "attention" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  const { error: upErr } = await db.storage
    .from("media")
    .upload(path, buf, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (upErr) fail(`upload ${path}`, upErr);
  const { data, error } = await db
    .from("media")
    .insert({ bucket: "media", path, kind: "image", mime_type: "image/jpeg", size_bytes: buf.length, width: 1200, height: 1500, alt: f.name, title: f.name })
    .select("id")
    .single();
  if (error) fail(`media ${path}`, error);
  return data.id;
}

const { error: igErr } = await db.from("people").select("instagram_url").limit(1);
const hasInstagram = !igErr;
if (!hasInstagram) console.log("! people.instagram_url missing — push the migration, then re-run to add Instagram links");

const { data: existing, error: existingErr } = await db.from("people").select("id, name").eq("kind", "founder");
if (existingErr) fail("people", existingErr);

const kept = new Set();
for (const [i, f] of founders.entries()) {
  const row = {
    kind: "founder",
    name: f.name,
    designation: f.designation,
    background: f.background,
    responsibility: null,
    linkedin_url: f.linkedin_url,
    photo_media_id: await portrait(f),
    sort_order: i + 1,
    status: "published",
    ...(hasInstagram && { instagram_url: f.instagram_url }),
  };
  const match = existing.find((e) => e.name === f.name);
  const { data, error } = match
    ? await db.from("people").update(row).eq("id", match.id).select("id").single()
    : await db.from("people").insert(row).select("id").single();
  if (error) fail(`founder ${f.name}`, error);
  kept.add(data.id);
}
console.log(`✔ ${founders.length} founders`);

const stale = existing.filter((e) => !kept.has(e.id)).map((e) => e.id);
if (stale.length) {
  const { error } = await db.from("people").update({ status: "archived" }).in("id", stale);
  if (error) fail("archive", error);
}
console.log(`✔ archived ${stale.length} other founders`);
