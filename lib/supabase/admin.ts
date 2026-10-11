import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { serverEnv } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS — use ONLY in server code for lead delivery,
 * OTP, rate limiting and private storage. Never import from a client component.
 */
export function createServiceClient() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
