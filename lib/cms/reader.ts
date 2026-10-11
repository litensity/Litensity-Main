import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createPublicClient } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export type Status = Database["public"]["Enums"]["publish_status"];

export interface Reader {
  db: SupabaseClient<Database>;
  /** Statuses visible in the current mode. Preview (admin draft mode) also shows drafts. */
  statuses: Status[];
  preview: boolean;
}

/**
 * Single entry point for public CMS reads. Normal visitors get the cached anon
 * client; an admin in draft mode gets their own session so drafts are visible.
 */
export const getReader = cache(async (): Promise<Reader> => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {
    // Outside a request scope (e.g. sitemap generation at build) — public mode.
  }
  if (preview) {
    return { db: await createSessionClient(), statuses: ["published", "draft"], preview };
  }
  return { db: createPublicClient(), statuses: ["published"], preview };
});

/** Throws a readable error for failed queries so error boundaries can surface it. */
type Ok<R> = R extends { error: null; data: infer D } ? D : never;

export function unwrap<R extends { data: unknown; error: { message: string } | null }>(result: R, context: string): Ok<R> {
  if (result.error) throw new Error(`[cms] ${context}: ${result.error.message}`);
  return result.data as Ok<R>;
}
