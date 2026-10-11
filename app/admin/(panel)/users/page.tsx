import Link from "next/link";
import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { removeAdmin } from "@/app/admin/actions";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notices } from "@/components/admin/Notices";

export const metadata: Metadata = { title: "Admin users" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const [me, sp] = await Promise.all([requireOwner(), searchParams]);
  const service = createServiceClient();
  const [{ data: profiles }, { data: users }] = await Promise.all([
    service.from("admin_profiles").select("user_id, role, display_name, created_at").order("created_at"),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  const emailOf = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> / <span>Access</span>
          </p>
          <h1>Admin users</h1>
          <p>Owners can manage admin access. Editors can manage all website content.</p>
        </div>
      </header>
      <Notices searchParams={sp} />
      <div className="a-two">
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>Team</h2>
          </div>
          <div className="a-list">
            {(profiles ?? []).map((p) => (
              <div key={p.user_id}>
                <span>
                  <strong>{p.display_name ?? emailOf.get(p.user_id)}</strong>
                  <br />
                  <span className="admin-muted">{emailOf.get(p.user_id)}</span>
                </span>
                <span className="admin-actions" style={{ alignItems: "center" }}>
                  <span className="a-badge">{p.role}</span>
                  {p.user_id !== me.id && (
                    <form action={removeAdmin.bind(null, p.user_id)}>
                      <ConfirmButton message="Remove this admin's access and delete their login?" className="a-btn a-btn-sm a-btn-danger">
                        Remove
                      </ConfirmButton>
                    </form>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>Add an admin</h2>
          </div>
          <div className="a-panel-body">
            <InviteAdminForm />
          </div>
        </section>
      </div>
    </>
  );
}
