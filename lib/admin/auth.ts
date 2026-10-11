import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: "owner" | "editor";
}

/** Resolves the signed-in admin (verified JWT + admin_profiles row), or null. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const db = await createSessionClient();
  const { data } = await db.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: profile } = await db.from("admin_profiles").select("display_name, role").eq("user_id", claims.sub).maybeSingle();
  if (!profile) return null;
  return { id: claims.sub, email: String(claims.email ?? ""), displayName: profile.display_name, role: profile.role };
});

/**
 * Server-side gate for every admin page and action. Never rely on the proxy
 * redirect alone — this re-verifies the session and admin role.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireOwner(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin?error=owner-only");
  return admin;
}
