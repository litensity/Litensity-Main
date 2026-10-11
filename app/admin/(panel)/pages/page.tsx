import Link from "next/link";
import type { Metadata } from "next";
import { loadPages } from "@/lib/admin/pages";
import { PAGE_PATHS } from "@/lib/sections/kinds";

export const metadata: Metadata = { title: "Pages" };

const ORDER = ["home", "brands", "brand-template", "invest", "stores", "about", "csr", "careers", "contact"];
const BLURB: Record<string, string> = {
  home: "The front door — hero, brands, numbers, footprint and more.",
  brands: "The brand hub with comparison table.",
  "brand-template": "One layout shared by every brand page. Brand content lives under Brands.",
  invest: "Group investor story and the investor enquiry form.",
  stores: "Store locator page intro.",
  about: "Company story, milestones, founders and values.",
  csr: "Focus areas, initiatives, impact and partner form.",
  careers: "Why join, life at Litensity, open roles and applications.",
  contact: "Office, departments and the general enquiry form.",
};
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function PagesIndex() {
  const pages = (await loadPages()).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Pages</h1>
          <p>Choose a page to rearrange, add, duplicate, hide or edit its sections — with a live preview beside the editor.</p>
        </div>
      </header>
      <div className="p-grid">
        {pages.map((p) => (
          <Link key={p.key} href={`/admin/pages/${p.key}`} className="p-card">
            <span className="p-card-top">
              <strong>{p.name}</strong>
              <span className="admin-muted">{PAGE_PATHS[p.key] === "/brands/bigguys" ? "/brands/…" : PAGE_PATHS[p.key]}</span>
            </span>
            <span className="admin-muted">{BLURB[p.key]}</span>
            <span className="p-card-meta">
              <span className="a-badge">{p.total} sections</span>
              {p.hidden > 0 && <span className="a-badge a-badge-archived">{p.hidden} hidden</span>}
              {p.updatedAt && <span className="admin-muted">Edited {dateFormat.format(new Date(p.updatedAt))}</span>}
            </span>
            <span className="p-card-cta">Edit page →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
