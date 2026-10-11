import type { Tables } from "@/types/database";

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  kind: Tables<"media">["kind"];
  mimeType: string;
  width: number | null;
  height: number | null;
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");

export function publicStorageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Maps a media row to a renderable asset. Private-bucket rows never get a URL. */
export function toMedia(row: Tables<"media"> | null | undefined, altOverride?: string | null): MediaAsset | null {
  if (!row || row.bucket !== "media") return null;
  return {
    id: row.id,
    url: publicStorageUrl(row.bucket, row.path),
    alt: altOverride ?? row.alt ?? "",
    kind: row.kind,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
  };
}
