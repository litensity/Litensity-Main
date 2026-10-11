import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const [admin, params] = await Promise.all([getAdmin(), searchParams]);
  const next = typeof params.next === "string" && params.next.startsWith("/admin") && !params.next.startsWith("//") ? params.next : "/admin";
  if (admin) redirect(next);
  return (
    <div className="a-login">
      <div className="a-login-card">
        <p className="admin-muted">Litensity Admin</p>
        <h1>Sign in</h1>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
