/*
 * The supported content structure. Pages and their sections are defined by the
 * application (layout is code); the admin edits the content inside them.
 */

export const PAGE_DEFINITIONS = [
  { key: "home", name: "Home", path: "/" },
  { key: "brands", name: "Our Brands", path: "/brands" },
  { key: "brand-template", name: "Brand page labels", path: "/brands" },
  { key: "invest", name: "Invest with Us", path: "/invest" },
  { key: "stores", name: "Store Locator", path: "/stores" },
  { key: "about", name: "About & Founders", path: "/about" },
  { key: "csr", name: "CSR", path: "/csr" },
  { key: "careers", name: "Careers", path: "/careers" },
  { key: "contact", name: "Contact", path: "/contact" },
] as const;

export const LIST_DEFINITIONS = [
  { key: "home.why_partner", label: "Home — Why partner pillars", path: "/" },
  { key: "home.enquiry_paths", label: "Home — Enquiry band rows (need a link)", path: "/" },
  { key: "invest.capabilities", label: "Invest — Operating capability", path: "/invest" },
  { key: "invest.roadmap", label: "Invest — Growth roadmap", path: "/invest" },
  { key: "about.values", label: "About — Values", path: "/about" },
  { key: "csr.focus", label: "CSR — Focus pillars", path: "/csr" },
  { key: "careers.why", label: "Careers — Why work with us", path: "/careers" },
  { key: "contact.routing", label: "Contact — Shortcuts (need a link)", path: "/contact" },
  { key: "brand.pillars", label: "Brand — Story pillars (choose brand)", path: null },
  { key: "brand.support", label: "Brand — Investment support (choose brand)", path: null },
  { key: "brand.process", label: "Brand — Enquiry-to-opening steps (choose brand)", path: null },
] as const;
