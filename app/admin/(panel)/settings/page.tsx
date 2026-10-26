import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Settings" };

const CARDS = [
  { href: "/admin/r/settings", title: "Company & contact", text: "Address, phone, email, WhatsApp, logo, sticky Enquire button, analytics." },
  { href: "/admin/r/forms", title: "Forms & lead routing", text: "Who gets alerts for each form, acknowledgement emails, dropdown options." },
  { href: "/admin/r/navigation", title: "Menus", text: "Header and footer links." },
  { href: "/admin/r/social", title: "Social links", text: "Instagram, LinkedIn and more — for the group and each brand." },
  { href: "/admin/r/departments", title: "Contact departments", text: "Department-wise emails and phone numbers on the Contact page." },
  { href: "/admin/r/seo", title: "SEO & sharing", text: "Search titles, descriptions and social preview images for every page." },
  { href: "/admin/r/legal", title: "Privacy Policy & Terms", text: "Legal pages linked from every form." },
];

export default async function SettingsHub() {
  const admin = await requireAdmin();
  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-crumbs">
            <Link href="/admin">Dashboard</Link> / <span>Settings</span>
          </p>
          <h1>Settings</h1>
          <p>Site-wide details that rarely change.</p>
        </div>
      </header>
      <div className="s-grid">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="s-card">
            <strong>{c.title}</strong>
            <span className="admin-muted">{c.text}</span>
          </Link>
        ))}
        {admin.role === "owner" && (
          <Link href="/admin/users" className="s-card">
            <strong>Admin users</strong>
            <span className="admin-muted">Who can sign in to this admin, and their role.</span>
          </Link>
        )}
      </div>
    </>
  );
}
