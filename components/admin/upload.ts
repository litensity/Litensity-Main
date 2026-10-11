"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { registerMedia } from "@/app/admin/actions";

const IMAGE = /^image\/(jpeg|png|webp|avif|svg\+xml)$/;
const VIDEO = /^video\/(mp4|webm)$/;
const PDF = /^application\/pdf$/;

export interface Uploaded {
  id: string;
  url: string | null;
  kind: "image" | "video" | "document";
  path: string;
  title: string;
}

async function dimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!IMAGE.test(file.type) || file.type === "image/svg+xml") return { width: null, height: null };
  try {
    const bitmap = await createImageBitmap(file);
    const out = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return out;
  } catch {
    return { width: null, height: null };
  }
}

function slugify(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "file";
}

/**
 * Uploads directly from the browser to Supabase Storage (admin RLS), then registers
 * the asset server-side. PDFs go to the private `documents` bucket; images/videos
 * to the public `media` bucket.
 */
export async function uploadFile(file: File): Promise<Uploaded> {
  const kind = IMAGE.test(file.type) ? "image" : VIDEO.test(file.type) ? "video" : PDF.test(file.type) ? "document" : null;
  if (!kind) throw new Error(`${file.name}: unsupported file type. Use JPG, PNG, WebP, AVIF, SVG, MP4, WebM or PDF.`);
  const max = kind === "document" ? 25 : 20;
  if (file.size > max * 1024 * 1024) throw new Error(`${file.name}: larger than ${max} MB.`);
  if (kind === "image" && file.size > 3 * 1024 * 1024) {
    console.warn(`${file.name} is over 3 MB — consider compressing it for faster pages.`);
  }

  const bucket = kind === "document" ? "documents" : "media";
  const now = new Date();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${slugify(file.name)}.${ext}`;

  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`${file.name}: ${error.message}`);

  const { width, height } = await dimensions(file);
  const title = file.name.replace(/\.[^.]+$/, "");
  const result = await registerMedia({ bucket, path, kind, mimeType: file.type, sizeBytes: file.size, width, height, alt: "", title });
  if ("error" in result) {
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(`${file.name}: ${result.error}`);
  }
  const url = bucket === "media" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  return { id: result.id, url, kind, path, title };
}

export function acceptAttr(accept: string): string {
  if (accept === "document") return "application/pdf";
  if (accept === "video") return "video/mp4,video/webm";
  if (accept === "image-or-video") return "image/*,video/mp4,video/webm";
  return "image/jpeg,image/png,image/webp,image/avif,image/svg+xml";
}
