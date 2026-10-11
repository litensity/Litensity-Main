import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { serverEnv } from "@/lib/env";

export const CMS_TAG = "cms";
/** Safety-net ISR window; admin saves revalidate immediately. */
export const CMS_REVALIDATE_SECONDS = 300;

/**
 * Anonymous client for public CMS reads. RLS limits it to published rows.
 * Every request is tagged so admin mutations can invalidate the whole site at once.
 */
export function createPublicClient() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Development skips the data cache so direct DB edits (Studio, resets) show instantly.
      fetch: (input, init) =>
        process.env.NODE_ENV === "development"
          ? fetch(input, { ...init, cache: "no-store" })
          : fetch(input, { ...init, next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_TAG] } }),
    },
  });
}
