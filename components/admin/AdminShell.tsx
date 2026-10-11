import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminUser } from "@/lib/admin/auth";
import { signOut } from "@/app/admin/actions";
import { AdminNavLink } from "./AdminNavLink";

/*
 * Navigation is organised around tasks, not tables:
 * edit pages, manage brands & stores, update people/careers/CSR, read leads, settings.
 */
const NAV: { title?: string; links: { href: string; label: string; exact?: boolean }[] }[] = [
  {
    links: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/r/brands", label: "Brands" },
      { href: "/admin/r/stores", label: "Stores" },
      { href: "/admin/media", label: "Media library" },
    ],
  },
  {
    title: "About & team",
    links: [
      { href: "/admin/r/founders", label: "Founders" },
      { href: "/admin/r/leadership", label: "Leadership" },
      { href: "/admin/r/milestones", label: "Milestones" },
    ],
  },
  {
    title: "Careers",
    links: [
      { href: "/admin/r/jobs", label: "Open roles" },
      { href: "/admin/r/careers-gallery", label: "Team photos" },
    ],
  },
  {
    title: "CSR",
    links: [
      { href: "/admin/r/csr-initiatives", label: "Initiatives" },
      { href: "/admin/r/csr-photos", label: "Photographs" },
    ],
  },
  {
    title: "Investment",
    links: [
      { href: "/admin/r/investment-models", label: "Brand models" },
      { href: "/admin/r/brand-faqs", label: "Brand FAQs" },
    ],
  },
  {
    title: "Inbox",
    links: [
      { href: "/admin/r/leads", label: "Leads" },
      { href: "/admin/exports", label: "Export to Excel" },
    ],
  },
  {
    title: "Setup",
    links: [{ href: "/admin/settings", label: "Settings" }],
  },
];

export function AdminShell({ admin, children }: { admin: AdminUser; children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link href="/admin" className="admin-brand">
          Litensity<span>.</span>
          <small>Admin</small>
        </Link>
        <nav>
          {NAV.map((group, i) => (
            <div key={group.title ?? i} className="admin-nav-group">
              {group.title && <p className="admin-nav-title">{group.title}</p>}
              {group.links.map((l) => (
                <AdminNavLink key={l.href} href={l.href} exact={l.exact}>
                  {l.label}
                </AdminNavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-account">
          <p title={admin.email}>{admin.displayName ?? admin.email}</p>
          <p className="admin-muted">{admin.role === "owner" ? "Owner" : "Editor"}</p>
          <div className="admin-account-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">
              View site ↗
            </a>
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="admin-main" id="main">
        {children}
      </main>
    </div>
  );
}
