import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { serverEnv } from "@/lib/env";

/** Cookie-bound client acting as the signed-in admin. RLS enforces `is_admin()`. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — the proxy refreshes the session instead.
        }
      },
    },
  });
}
