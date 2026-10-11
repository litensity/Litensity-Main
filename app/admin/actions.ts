"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireOwner } from "@/lib/admin/auth";
import { adminDb, pk } from "@/lib/admin/data";
import { allFields, canDeleteRecords, getResource } from "@/lib/admin/resources";
import type { Field } from "@/lib/admin/types";
import { createServiceClient } from "@/lib/supabase/admin";

export interface SaveState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Postgres/PostgREST errors → messages an editor can act on. */
function friendlyError(message: string, code?: string): string {
  if (code === "23505") return "That value must be unique — another record already uses it.";
  if (code === "23503") return "This record is still referenced elsewhere (e.g. stores of a brand). Archive it instead.";
  if (message.includes("brands_brochure_requires_investment")) return "Turn on the investment block before enabling the brochure.";
  if (message.includes("brands_enquiry_requires_investment")) return "Turn on the investment block before enabling the investment enquiry.";
  if (message.includes("pincode")) return "Pincode must be a valid 6-digit Indian pincode.";
  if (message.includes("slug")) return "Slug may contain only lowercase letters, numbers and hyphens.";
  if (code === "23514") return `A value is not allowed: ${message}`;
  if (code === "42501") return "You don't have permission to make this change.";
  return message;
}

/** Maps a database error to the offending field when the constraint names it, so the form can highlight it. */
function dbError(table: string, error: { message: string; code?: string }): SaveState {
  const message = friendlyError(error.message, error.code);
  const match = error.message.match(new RegExp(`${table}_([a-z_]+?)_(check|key|fkey)`));
  if (match) return { status: "error", message: "Please fix the highlighted field.", fieldErrors: { [match[1]]: message } };
  return { status: "error", message };
}

function coerce(field: Field, raw: FormDataEntryValue | null): { value: unknown; error?: string } {
  const text = typeof raw === "string" ? raw.trim() : "";
  switch (field.type) {
    case "boolean":
      return { value: raw === "on" || raw === "true" };
    case "number": {
      if (text === "") return { value: null };
      const n = Number(text);
      return Number.isFinite(n) ? { value: n } : { value: null, error: "Enter a number" };
    }
    case "tags":
      return {
        value: text
          .split(/\r?\n/)
          .map((t) => t.trim())
          .filter(Boolean),
      };
    case "color":
      return HEX.test(text) ? { value: text.toUpperCase() } : { value: null, error: "Use a 6-digit hex colour, e.g. #E0461B" };
    case "url":
      if (text === "") return { value: null };
      return /^https?:\/\/\S+$/i.test(text) ? { value: text } : { value: null, error: "Enter a full URL starting with https://" };
    case "email":
      if (text === "") return { value: null };
      return /^\S+@\S+\.\S+$/.test(text) ? { value: text.toLowerCase() } : { value: null, error: "Enter a valid email" };
    case "select": {
      // Tri-state booleans stored as "true"/"false" (e.g. veg marker).
      const values = field.options?.map((o) => o.value) ?? [];
      if (values.includes("true") && values.includes("false")) return { value: text === "" ? null : text === "true" };
      if (text !== "" && values.length && !values.includes(text)) return { value: null, error: "Choose a valid option" };
      return { value: text === "" ? null : text };
    }
    default:
      return { value: text === "" ? null : text };
  }
}

async function saveHours(storeId: string, formData: FormData) {
  const db = await adminDb();
  const rows = Array.from({ length: 7 }, (_, day) => {
    const closed = formData.get(`hours_${day}_closed`) === "on";
    const opens = String(formData.get(`hours_${day}_opens`) ?? "").trim();
    const closes = String(formData.get(`hours_${day}_closes`) ?? "").trim();
    return {
      store_id: storeId,
      day_of_week: day,
      is_closed: closed || !opens || !closes,
      opens_at: closed || !opens ? null : opens,
      closes_at: closed || !closes ? null : closes,
    };
  });
  const { error } = await db.from("store_hours").upsert(rows, { onConflict: "store_id,day_of_week" });
  if (error) throw new Error(error.message);
}

function revalidateSite() {
  // Every public page reads the CMS; invalidate the whole site so changes appear immediately.
  revalidatePath("/", "layout");
}

export async function saveRecord(resourceKey: string, id: string | null, _: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource || resource.readOnly) return { status: "error", message: "This record can't be edited." };
  if (!id && resource.canCreate === false) return { status: "error", message: "New records can't be created here." };

  const payload: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of allFields(resource)) {
    if (field.readOnly || field.type === "hours") continue;
    if (id && field.createOnly) continue;
    const { value, error } = coerce(field, formData.get(field.name));
    if (error) {
      fieldErrors[field.name] = error;
      continue;
    }
    const empty = value === null || value === "" || (Array.isArray(value) && value.length === 0 && field.required);
    if (field.required && empty && field.type !== "boolean") {
      fieldErrors[field.name] = `${field.label} is required`;
      continue;
    }
    payload[field.name] = value;
  }
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };

  Object.assign(payload, resource.scope ?? {});
  const db = await adminDb();
  const key = pk(resource);
  let savedId = id;

  if (resource.singleton) {
    const { error } = await db.from(resource.table).update(payload).eq(key, id ?? 1);
    if (error) return { status: "error", message: friendlyError(error.message, error.code) };
  } else if (id) {
    const { error } = await db.from(resource.table).update(payload).eq(key, id);
    if (error) return dbError(resource.table, error);
  } else {
    const { data, error } = await db.from(resource.table).insert(payload).select(key).single();
    if (error) return dbError(resource.table, error);
    savedId = String((data as unknown as Record<string, unknown>)[key]);
  }

  if (allFields(resource).some((f) => f.type === "hours") && savedId) {
    try {
      await saveHours(savedId, formData);
    } catch (err) {
      return { status: "error", message: `Saved, but opening hours failed: ${err instanceof Error ? err.message : err}` };
    }
  }

  revalidateSite();
  const back = String(formData.get("__return") ?? "");
  if (back.startsWith("/admin/")) redirect(`${back}${back.includes("?") ? "&" : "?"}saved=1`);
  redirect(resource.singleton ? `/admin/r/${resource.key}?saved=1` : `/admin/r/${resource.key}/${encodeURIComponent(savedId!)}?saved=1`);
}

export async function deleteRecord(resourceKey: string, id: string, returnTo?: string) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource || !canDeleteRecords(resource)) throw new Error("Not allowed");
  const db = await adminDb();
  // RLS silently filters rows it won't let us delete, so an empty result means nothing was removed.
  const { data, error } = await db.from(resource.table).delete().eq(pk(resource), id).select(pk(resource));
  const message = error ? friendlyError(error.message, error.code) : data.length === 0 ? "This record could not be deleted (it may already be gone, or you lack permission)." : null;
  if (message) redirect(`/admin/r/${resource.key}/${encodeURIComponent(id)}?error=${encodeURIComponent(message)}`);
  revalidateSite();
  redirect(returnTo?.startsWith("/admin/") ? returnTo : `/admin/r/${resource.key}?deleted=1`);
}

/** Moves a record up/down within its group (same leading orderBy columns + scope). */
export async function moveRecord(resourceKey: string, id: string, direction: "up" | "down", returnTo: string) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource?.sortable) throw new Error("Not sortable");
  const db = await adminDb();
  const { data: current } = await db.from(resource.table).select("*").eq("id", id).maybeSingle();
  if (!current) return;

  const groupCols = (resource.orderBy ?? []).map((o) => o.column).filter((c) => c !== "sort_order");
  let req = db.from(resource.table).select("id, sort_order");
  for (const col of groupCols) req = current[col] === null ? req.is(col, null) : req.eq(col, current[col]);
  for (const [col, val] of Object.entries(resource.scope ?? {})) req = req.eq(col, val);
  const { data: siblings } = await req.order("sort_order").order("id");
  const list = (siblings ?? []) as { id: string; sort_order: number }[];

  const index = list.findIndex((r) => r.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) {
    redirect(returnTo.startsWith("/admin/") ? returnTo : `/admin/r/${resource.key}`);
  }
  [list[index], list[target]] = [list[target], list[index]];
  // Renumber in steps of 10 so editors can still slot items in manually.
  await Promise.all(list.map((r, i) => db.from(resource.table).update({ sort_order: (i + 1) * 10 }).eq("id", r.id)));
  revalidateSite();
  redirect(returnTo.startsWith("/admin/") ? returnTo : `/admin/r/${resource.key}`);
}

/* ------------------------------------------------------------------ Media */

const MEDIA_RULES: Record<string, { kinds: string[]; mimes: RegExp; maxBytes: number }> = {
  media: { kinds: ["image", "video"], mimes: /^(image\/(jpeg|png|webp|avif|svg\+xml)|video\/(mp4|webm))$/, maxBytes: 20 * 1024 * 1024 },
  documents: { kinds: ["document"], mimes: /^application\/pdf$/, maxBytes: 25 * 1024 * 1024 },
};

export interface RegisterMediaInput {
  bucket: "media" | "documents";
  path: string;
  kind: "image" | "video" | "document";
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  title: string;
}

/** Records an asset the browser uploaded directly to Storage (RLS: admins only). */
export async function registerMedia(input: RegisterMediaInput): Promise<{ id: string } | { error: string }> {
  await requireAdmin();
  const rule = MEDIA_RULES[input.bucket];
  if (!rule) return { error: "Unknown storage bucket" };
  if (!rule.kinds.includes(input.kind) || !rule.mimes.test(input.mimeType)) return { error: "This file type isn't allowed here." };
  if (input.sizeBytes <= 0 || input.sizeBytes > rule.maxBytes) return { error: "File is too large." };
  if (!/^[a-z0-9][a-z0-9/_.-]{3,200}$/i.test(input.path) || input.path.includes("..")) return { error: "Invalid file path." };

  const db = await adminDb();
  // Make sure the object really exists in storage before registering it.
  const folder = input.path.split("/").slice(0, -1).join("/");
  const name = input.path.split("/").pop()!;
  const { data: objects } = await db.storage.from(input.bucket).list(folder, { search: name, limit: 1 });
  if (!objects?.some((o) => o.name === name)) return { error: "Upload not found — please try again." };

  const { data, error } = await db
    .from("media")
    .insert({
      bucket: input.bucket,
      path: input.path,
      kind: input.kind,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width,
      height: input.height,
      alt: input.alt.slice(0, 300),
      title: input.title.slice(0, 200) || null,
    })
    .select("id")
    .single();
  if (error) return { error: friendlyError(error.message, error.code) };
  return { id: String(data.id) };
}

export async function listMediaForPicker(kind: string, q: string): Promise<{ id: string; url: string | null; title: string | null; path: string; kind: string; bucket: string }[]> {
  await requireAdmin();
  const db = await adminDb();
  let req = db.from("media").select("id, bucket, path, kind, title, alt").order("created_at", { ascending: false }).limit(60);
  if (kind === "image-or-video") req = req.in("kind", ["image", "video"]);
  else if (kind) req = req.eq("kind", kind);
  const term = q.replace(/[%,()]/g, " ").trim();
  if (term) req = req.or(`title.ilike.%${term}%,alt.ilike.%${term}%,path.ilike.%${term}%`);
  const { data } = await req;
  const { publicStorageUrl } = await import("@/lib/cms/media");
  return ((data ?? []) as Record<string, string>[]).map((m) => ({
    id: m.id,
    url: m.bucket === "media" ? publicStorageUrl(m.bucket, m.path) : null,
    title: m.title || m.alt || null,
    path: m.path,
    kind: m.kind,
    bucket: m.bucket,
  }));
}

/** Deletes a media row and its stored file (fails while the asset is in use). */
export async function deleteMedia(id: string) {
  await requireAdmin();
  const db = await adminDb();
  const { data: media } = await db.from("media").select("bucket, path").eq("id", id).maybeSingle();
  if (!media) redirect("/admin/media");
  const { error } = await db.from("media").delete().eq("id", id);
  if (error) redirect(`/admin/r/media/${id}?error=${encodeURIComponent(friendlyError(error.message, error.code))}`);
  await db.storage.from(String(media.bucket)).remove([String(media.path)]);
  revalidateSite();
  redirect("/admin/media?deleted=1");
}

/* ------------------------------------------------------------ Admin users */

export async function inviteAdmin(_: SaveState, formData: FormData): Promise<SaveState> {
  await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "owner" ? "owner" : "editor";
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  if (!/^\S+@\S+\.\S+$/.test(email)) return { status: "error", fieldErrors: { email: "Enter a valid email" } };
  if (password.length < 12) return { status: "error", fieldErrors: { password: "Use at least 12 characters" } };

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) return { status: "error", message: error?.message ?? "Could not create the user." };
  const { error: profileError } = await service.from("admin_profiles").insert({ user_id: data.user.id, role, display_name: displayName });
  if (profileError) return { status: "error", message: profileError.message };
  redirect("/admin/users?saved=1");
}

export async function removeAdmin(userId: string) {
  const me = await requireOwner();
  if (userId === me.id) redirect("/admin/users?error=self");
  const service = createServiceClient();
  await service.from("admin_profiles").delete().eq("user_id", userId);
  await service.auth.admin.deleteUser(userId);
  redirect("/admin/users?deleted=1");
}

/* --------------------------------------------------------- Sample content */

/** Rows the sample loader may insert, children before parents. Media goes last (files too). */
const SAMPLE_DELETE_ORDER = [
  "gallery_items",
  "store_order_links",
  "store_hours",
  "products",
  "campaigns",
  "delivery_links",
  "social_links",
  "content_items",
  "stats",
  "faqs",
  "investment_models",
  "milestones",
  "people",
  "jobs",
  "csr_initiatives",
];

/**
 * Removes everything loaded by scripts/seed-samples.mjs: restores every field the loader
 * overwrote (placeholders come back exactly as they were), deletes the rows it inserted,
 * then deletes its media rows and stored files.
 */
export async function removeSampleContent() {
  await requireAdmin();
  const db = await adminDb();

  // 1. Put back original values (before deleting media, so restored ids are still valid FKs).
  const { data: backups } = await db.from("sample_field_backups").select("table_name, pk_column, pk_value, column_name, original");
  type Restore = { table: string; pkColumn: string; pkValue: string; values: Record<string, unknown> };
  type Backup = { table_name: string; pk_column: string; pk_value: string; column_name: string; original: unknown };
  const grouped = new Map<string, Restore>();
  for (const b of (backups ?? []) as Backup[]) {
    const key = `${b.table_name}|${b.pk_value}`;
    const entry: Restore = grouped.get(key) ?? { table: b.table_name, pkColumn: b.pk_column, pkValue: b.pk_value, values: {} };
    entry.values[b.column_name] = b.original;
    grouped.set(key, entry);
  }
  for (const { table, pkColumn, pkValue, values } of grouped.values()) {
    // Table names come from our own backup rows, not from user input.
    await db.from(table as "brands").update(values as never).eq(pkColumn as "id", pkValue);
  }

  // 2. Delete inserted rows.
  const { data: records } = await db.from("sample_records").select("table_name, record_id");
  const byTable = new Map<string, string[]>();
  for (const r of (records ?? []) as { table_name: string; record_id: string }[]) {
    byTable.set(r.table_name, [...(byTable.get(r.table_name) ?? []), r.record_id]);
  }
  for (const table of SAMPLE_DELETE_ORDER) {
    const ids = byTable.get(table);
    if (ids?.length) await db.from(table as "brands").delete().in("id", ids);
  }

  // 3. Media rows and their files (public media and private documents).
  const mediaIds = byTable.get("media") ?? [];
  if (mediaIds.length) {
    const { data: files } = await db.from("media").select("bucket, path").in("id", mediaIds);
    await db.from("media").delete().in("id", mediaIds);
    for (const bucket of ["media", "documents"]) {
      const paths = ((files ?? []) as { bucket: string; path: string }[]).filter((f) => f.bucket === bucket).map((f) => f.path);
      if (paths.length) await db.storage.from(bucket).remove(paths);
    }
  }

  await db.from("sample_field_backups").delete().neq("table_name", "");
  await db.from("sample_records").delete().neq("table_name", "");
  revalidateSite();
  redirect("/admin?samples=removed");
}

export async function signOut() {
  const db = await adminDb();
  await db.auth.signOut();
  redirect("/admin/login");
}

