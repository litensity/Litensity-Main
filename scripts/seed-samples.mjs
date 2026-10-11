// Loads SAMPLE pictures, a film loop, copy, figures and records so the site can be previewed fully populated.
//   node --env-file=.env.local scripts/seed-samples.mjs
// Safe to re-run: every phase skips what is already there.
// Everything inserted is recorded in `sample_records`; every existing field it overwrites is saved in
// `sample_field_backups`. Admin → Dashboard → "Remove sample content" restores the originals and deletes the rest.
// Images are CC0 / public-domain photographs from Wikimedia Commons (see scripts/sample-content.json);
// copy and figures are illustrative (scripts/sample-copy.mjs) — never Litensity facts.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { inserts, patches, productPrices, sampleRowCopy, storeCopy } from "./sample-copy.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const manifest = JSON.parse(fs.readFileSync(new URL("./sample-content.json", import.meta.url), "utf8"));
const UA = { "User-Agent": "LitensityDevSeed/1.0 (sample content for local development and client preview)" };
const MARKER = "[CLIENT CONTENT REQUIRED]";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- helpers */
const { data: existingRecords } = await db.from("sample_records").select("table_name, record_id");
const sampleIds = new Set((existingRecords ?? []).map((r) => `${r.table_name}:${r.record_id}`));
const hasSampleRows = (table) => (existingRecords ?? []).some((r) => r.table_name === table);
const isSample = (table, id) => sampleIds.has(`${table}:${id}`);

async function record(table, id) {
  sampleIds.add(`${table}:${id}`);
  await db.from("sample_records").upsert({ table_name: table, record_id: String(id) });
}

/** Saves a field's original value once (the first backup wins on re-runs). */
async function backup(table, pkColumn, pkValue, column, original) {
  await db
    .from("sample_field_backups")
    .upsert(
      { table_name: table, pk_column: pkColumn, pk_value: String(pkValue), column_name: column, original: original ?? null },
      { onConflict: "table_name,pk_value,column_name", ignoreDuplicates: true },
    );
}

const isMissing = (v) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && (v.trim() === "" || v.includes(MARKER))) ||
  (Array.isArray(v) && (v.length === 0 || v.some((x) => typeof x === "string" && x.includes(MARKER))));

function thumbUrl(original, width) {
  const m = original.match(/upload\.wikimedia\.org\/wikipedia\/commons\/(\w)\/(\w\w)\/(.+)$/);
  if (!m) return original;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/${width}px-${m[3]}`;
}

async function download(src) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(thumbUrl(src, 1920), { headers: UA });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      const wait = 15000 * (attempt + 1);
      console.log(`  rate limited (${res.status}), waiting ${wait / 1000}s…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`${res.status} for ${src}`);
  }
  throw new Error(`Gave up downloading ${src}`);
}

function jpegSize(buf) {
  // Reads width/height from the JPEG SOF marker (no image library needed).
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return { width: null, height: null };
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return { width: null, height: null };
}

async function storeMedia({ bucket = "media", path, buf, kind, mime, width = null, height = null, alt = "", title }) {
  const { data: found } = await db.from("media").select("id").eq("bucket", bucket).eq("path", path).maybeSingle();
  if (found) return found.id;
  const { error: upErr } = await db.storage.from(bucket).upload(path, buf, { contentType: mime, upsert: true, cacheControl: "31536000" });
  if (upErr) throw new Error(`${path}: ${upErr.message}`);
  const { data: row, error } = await db
    .from("media")
    .insert({ bucket, path, kind, mime_type: mime, size_bytes: buf.length, width, height, alt, title })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await record("media", row.id);
  return row.id;
}

/* ------------------------------------------------------------- 1. images */
const media = {};
for (const img of manifest.images) {
  const path = `samples/${img.key}.jpg`;
  const { data: found } = await db.from("media").select("id").eq("bucket", "media").eq("path", path).maybeSingle();
  if (found) {
    media[img.key] = found.id;
    continue;
  }
  process.stdout.write(`↓ ${img.key} … `);
  const buf = await download(img.url);
  const { width, height } = jpegSize(buf);
  media[img.key] = await storeMedia({
    path,
    buf,
    kind: "image",
    mime: "image/jpeg",
    width,
    height,
    alt: img.alt,
    title: `Sample · ${img.title} (${img.license.toUpperCase()}, Wikimedia Commons${img.creator ? ` — ${img.creator}` : ""})`,
  });
  console.log(`${Math.round(buf.length / 1024)} KB`);
  await sleep(1500);
}

// Local files shipped with the repo (group film loop + its poster frame).
for (const item of manifest.localMedia ?? []) {
  const buf = fs.readFileSync(new URL(`./${item.file}`, import.meta.url));
  const ext = item.file.split(".").pop();
  media[item.key] = await storeMedia({
    path: `samples/${item.key}.${ext}`,
    buf,
    kind: item.kind,
    mime: item.mime,
    width: item.width,
    height: item.height,
    alt: item.alt,
    title: item.title,
  });
}
console.log("✔ media");

/* ---------------------------------------------------------- 2. placements */
const { data: brands } = await db.from("brands").select("id, slug, hero_media_id, card_media_id");
const brandId = Object.fromEntries((brands ?? []).map((b) => [b.slug, b.id]));
/** A slot may take sample media when it is empty or already holds sample media — never over real content. */
const replaceable = (currentId) => !currentId || isSample("media", currentId);

for (const [slug, slots] of Object.entries(manifest.brands)) {
  const b = brands?.find((x) => x.slug === slug);
  if (!b) continue;
  const patch = {};
  if (slots.hero && replaceable(b.hero_media_id)) patch.hero_media_id = media[slots.hero];
  if (slots.card && replaceable(b.card_media_id)) patch.card_media_id = media[slots.card];
  if (Object.keys(patch).length) await db.from("brands").update(patch).eq("id", b.id);
}

const { data: sectionRows } = await db.from("page_sections").select("id, page_key, section_key, media_id, video_media_id");
const sectionId = (page, keyName) => sectionRows?.find((s) => s.page_key === page && s.section_key === keyName)?.id ?? null;
for (const [ref, imageKey] of Object.entries(manifest.sections)) {
  const [pageKey, sectionKey] = ref.split("/");
  const s = sectionRows?.find((x) => x.page_key === pageKey && x.section_key === sectionKey);
  if (s && replaceable(s.media_id)) await db.from("page_sections").update({ media_id: media[imageKey] }).eq("id", s.id);
}
for (const [ref, videoKey] of Object.entries(manifest.sectionVideos ?? {})) {
  const [pageKey, sectionKey] = ref.split("/");
  const s = sectionRows?.find((x) => x.page_key === pageKey && x.section_key === sectionKey);
  if (s && replaceable(s.video_media_id)) await db.from("page_sections").update({ video_media_id: media[videoKey] }).eq("id", s.id);
}
console.log("✔ placements");

/* ------------------------------------------- 3. first-run sample rows (once) */
if (!hasSampleRows("gallery_items")) {
  for (const g of manifest.galleries) {
    for (const [i, imageKey] of g.images.entries()) {
      const img = manifest.images.find((x) => x.key === imageKey);
      const { data } = await db
        .from("gallery_items")
        .insert({ collection: g.collection, brand_id: g.brand ? brandId[g.brand] : null, media_id: media[imageKey], caption: img?.caption ?? null, tag: img?.tag ?? null, sort_order: 100 + i, status: "published" })
        .select("id")
        .single();
      if (data) await record("gallery_items", data.id);
    }
  }
}

if (!hasSampleRows("products")) {
  for (const p of manifest.products) {
    const { data: cat } = await db.from("product_categories").select("id").eq("brand_id", brandId[p.brand]).eq("name", p.category).maybeSingle();
    const { data } = await db
      .from("products")
      .insert({ brand_id: brandId[p.brand], category_id: cat?.id ?? null, name: p.name, description: p.description, is_bestseller: Boolean(p.bestseller), is_veg: p.veg ?? null, media_id: p.image ? media[p.image] : null, sort_order: 100, status: "published" })
      .select("id")
      .single();
    if (data) await record("products", data.id);
  }
}

if (!hasSampleRows("campaigns")) {
  for (const c of manifest.campaigns) {
    const { data } = await db
      .from("campaigns")
      .insert({ brand_id: brandId[c.brand], kind: c.kind, title: c.title, body: c.body, media_id: media[c.image], sort_order: 100, status: "published" })
      .select("id")
      .single();
    if (data) await record("campaigns", data.id);
  }
}

if (!hasSampleRows("csr_initiatives")) {
  for (const [i, init] of manifest.csr.entries()) {
    const { data } = await db
      .from("csr_initiatives")
      .insert({ title: init.title, location: init.location, description: init.description, sort_order: 100 + i, status: "published" })
      .select("id")
      .single();
    if (!data) continue;
    await record("csr_initiatives", data.id);
    for (const [j, imageKey] of init.images.entries()) {
      const { data: g } = await db
        .from("gallery_items")
        .insert({ collection: "csr", csr_initiative_id: data.id, media_id: media[imageKey], sort_order: j, status: "published" })
        .select("id")
        .single();
      if (g) await record("gallery_items", g.id);
    }
  }
}
console.log("✔ galleries, menus, campaigns, CSR");

/* ------------------------------------------------- 4. copy over placeholders */
function applyMatch(q, match, section) {
  for (const [col, val] of Object.entries(match ?? {})) {
    if (col === "brand") q = val === null ? q.is("brand_id", null) : q.eq("brand_id", brandId[val]);
    else q = val === null ? q.is(col, null) : q.eq(col, val);
  }
  if (section) q = q.eq("section_id", sectionId(...section));
  return q;
}

let written = 0;
for (const p of patches) {
  const pkColumn = p.pk?.column ?? "id";
  let q = db.from(p.table).select("*");
  q = p.pk ? q.eq(p.pk.column, p.pk.value) : applyMatch(q, p.match, p.section);
  const { data: rows, error } = await q;
  if (error || !rows?.length) {
    console.warn(`  ! no row for ${p.table} ${JSON.stringify(p.pk ?? p.match)}${error ? ` (${error.message})` : ""}`);
    continue;
  }
  for (const row of p.many ? rows : rows.slice(0, 1)) {
    const pkValue = row[pkColumn];
    const sampleRow = isSample(p.table, pkValue);
    const update = {};
    for (const [col, val] of Object.entries(p.set)) {
      const allowed = sampleRow || p.force?.includes(col) || isMissing(row[col]);
      if (!allowed || JSON.stringify(row[col]) === JSON.stringify(val)) continue;
      if (!sampleRow) await backup(p.table, pkColumn, pkValue, col, row[col]);
      update[col] = val;
    }
    if (Object.keys(update).length) {
      const { error: upErr } = await db.from(p.table).update(update).eq(pkColumn, pkValue);
      if (upErr) console.warn(`  ! ${p.table} ${pkValue}: ${upErr.message}`);
      else written++;
    }
  }
}
console.log(`✔ copy (${written} rows updated)`);

/* ---------------------------------------------------------- 5. new rows */
const IDENTITY = {
  stats: ["scope", "label", "section_id"],
  content_items: ["title", "section_id", "list_key", "brand_id"],
  faqs: ["scope", "brand_id", "question"],
  people: ["kind", "designation"],
  jobs: ["title"],
  delivery_links: ["brand_id", "platform"],
  social_links: ["brand_id", "platform"],
  campaigns: ["title"],
  investment_models: ["brand_id", "name"],
};

let inserted = 0;
for (const [table, rows] of Object.entries(inserts)) {
  for (const raw of rows) {
    const row = { ...raw };
    if ("section" in row) {
      row.section_id = sectionId(...row.section);
      delete row.section;
    }
    if ("brand" in row) {
      row.brand_id = row.brand ? brandId[row.brand] : null;
      delete row.brand;
    }
    if ("image" in row) {
      row.media_id = media[row.image] ?? null;
      delete row.image;
    }
    let q = db.from(table).select("id");
    for (const col of IDENTITY[table]) q = row[col] === null || row[col] === undefined ? q.is(col, null) : q.eq(col, row[col]);
    const { data: existing } = await q.limit(1);
    if (existing?.length) continue;
    const { data, error } = await db.from(table).insert(row).select("id").single();
    if (error) console.warn(`  ! insert ${table}: ${error.message}`);
    else {
      await record(table, data.id);
      inserted++;
    }
  }
}
console.log(`✔ new rows (${inserted} inserted)`);

/* --------------------------------------------- 6. tidy the first-run sample rows */
for (const [table, items] of Object.entries(sampleRowCopy)) {
  for (const item of items) {
    const { data: row } = await db.from(table).select("id").eq("title", item.match).maybeSingle();
    if (row && isSample(table, row.id)) await db.from(table).update(item.set).eq("id", row.id);
  }
}
const { data: sampleProducts } = await db.from("products").select("id, name, description, price_label");
for (const p of sampleProducts ?? []) {
  if (!isSample("products", p.id)) continue;
  const patch = {};
  if (p.description?.startsWith("Sample item — ")) {
    const d = p.description.slice("Sample item — ".length);
    patch.description = d.charAt(0).toUpperCase() + d.slice(1);
  }
  if (!p.price_label && productPrices[p.name]) patch.price_label = productPrices[p.name];
  if (Object.keys(patch).length) await db.from("products").update(patch).eq("id", p.id);
}
console.log("✔ sample rows tidied");

/* --------------------------------------------------- 7. store names & photos */
const { data: stores } = await db.from("stores").select("id, name, address, photo_media_id");
for (const s of stores ?? []) {
  const copy = storeCopy[s.name];
  if (!copy) continue;
  const patch = { name: copy.name, address: copy.address };
  await backup("stores", "id", s.id, "name", s.name);
  await backup("stores", "id", s.id, "address", s.address);
  if (copy.image && replaceable(s.photo_media_id)) patch.photo_media_id = media[copy.image];
  await db.from("stores").update(patch).eq("id", s.id);
}
console.log("✔ stores");

/* ---------------------------------------- 8. sample menus & brochures (PDF) */
/** Minimal single-page PDF (Helvetica, WinAnsi-safe text) — no library needed. */
function pdf(title, color, lines) {
  const ascii = (t) => t.replace(/₹/g, "Rs. ").replace(/[–—]/g, "-").replace(/·/g, "-").replace(/[‘’]/g, "'").replace(/[^\x20-\x7E]/g, "");
  const esc = (t) => ascii(t).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const [r, g, b] = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  let y = 700;
  const body = lines
    .map(([size, text, gap = 8]) => {
      y -= size + gap;
      return `BT /F1 ${size} Tf 56 ${y} Td (${esc(text)}) Tj ET`;
    })
    .join("\n");
  const stream = `${r} ${g} ${b} rg 0 742 595 100 re f\n1 1 1 rg BT /F1 30 Tf 56 782 Td (${esc(title)}) Tj ET\n0.09 0.07 0.05 rg\n${body}\n0.5 0.5 0.5 rg BT /F1 8 Tf 56 40 Td (${esc("Sample document for website preview only - not a Litensity offer or price list.")}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const { data: brandRows } = await db.from("brands").select("id, slug, name, color_primary");
const { data: allProducts } = await db.from("products").select("brand_id, name, description, price_label, status").eq("status", "published");
const { data: downloads } = await db.from("downloads").select("id, brand_id, kind, title, file_media_id, status");
for (const d of downloads ?? []) {
  if (d.file_media_id) continue; // a real (or earlier) file is attached — leave it
  const b = brandRows?.find((x) => x.id === d.brand_id);
  if (!b) continue;
  let lines;
  if (d.kind === "menu") {
    lines = [[16, "Menu", 18]];
    for (const p of (allProducts ?? []).filter((x) => x.brand_id === b.id && !x.name.includes(MARKER))) {
      lines.push([12, `${p.name}${p.price_label ? `    ${p.price_label}` : ""}`, 14]);
      if (p.description) lines.push([9, p.description, 4]);
    }
  } else {
    lines = [
      [16, "Franchise opportunity", 18],
      [11, `Partner with ${b.name} and Litensity Food & Beverages.`, 12],
      [13, "What you get", 22],
      ...["Brand licence and launch marketing", "Store design and fit-out supervision", "Training for the opening team", "Central supply of key ingredients", "Area manager support and weekly reviews"].map((t) => [10, `- ${t}`, 6]),
      [13, "Process", 22],
      [10, "Enquiry > Discovery call > Site & format > Agreement > Fit-out & training > Opening", 6],
      [13, "Talk to us", 22],
      [10, "hello@litensity.com", 6],
    ];
  }
  const buf = pdf(b.name, b.color_primary, lines);
  const mediaRowId = await storeMedia({
    bucket: "documents",
    path: `samples/${b.slug}-${d.kind}.pdf`,
    buf,
    kind: "document",
    mime: "application/pdf",
    alt: d.title,
    title: `Sample · ${d.title}`,
  });
  await backup("downloads", "id", d.id, "status", d.status);
  await db.from("downloads").update({ file_media_id: mediaRowId, status: "published" }).eq("id", d.id);
}
console.log("✔ downloads");

console.log("\n✔ Sample content loaded. Remove it any time from Admin → Dashboard → Remove sample content.");
