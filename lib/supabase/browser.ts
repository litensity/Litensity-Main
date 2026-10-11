"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Browser client — used by the admin login form and direct-to-storage uploads only. */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
