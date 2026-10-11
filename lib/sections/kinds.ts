/*
 * Section kinds — the building blocks editors can arrange on a page.
 * Each kind is a designed component (components/sections/*). Editors choose,
 * order, hide, duplicate and fill sections; the design system stays intact.
 * Shared by the public renderer and the admin page builder.
 */

export type SectionField = "eyebrow" | "heading" | "subheading" | "body" | "cta" | "cta2" | "media" | "video";
export type ItemField = "title" | "body" | "icon" | "href" | "meta" | "media";
export type Tone = "paper" | "cream" | "ink" | "ember" | "brand";

export interface SectionKind {
  key: string;
  label: string;
  description: string;
  /** Where the kind may be added. "content" = every normal page (not the brand template). */
  pages: "content" | string[];
  fields: SectionField[];
  labels?: Partial<Record<SectionField, string>>;
  help?: Partial<Record<SectionField, string>>;
  tones?: Tone[];
  layouts?: { value: string; label: string }[];
  items?: {
    label: string;
    singular: string;
    fields: ItemField[];
    labels?: Partial<Record<ItemField, string>>;
  };
  stats?: boolean;
  /** Data-driven blocks that make sense once per page. */
  unique?: boolean;
  /** Heroes: always first, cannot be moved, duplicated or deleted. */
  pinned?: boolean;
  /** Where the block's underlying data is edited. */
  dataLink?: { label: string; href: string };
}

const BASIC: SectionField[] = ["eyebrow", "heading", "body"];
const ALL_TONES: Tone[] = ["paper", "cream", "ink", "ember"];

export const SECTION_KINDS: SectionKind[] = [
  /* ------------------------------------------------ Generic building blocks */
  {
    key: "page_hero",
    label: "Page hero",
    description: "Large opening heading with optional image, intro and buttons.",
    pages: "content",
    fields: ["eyebrow", "heading", "body", "cta", "cta2", "media", "video"],
    pinned: true,
    tones: ["paper", "ink", "ember"],
    layouts: [
      { value: "type", label: "Typography only" },
      { value: "split", label: "Text + tall image" },
      { value: "image", label: "Full-screen photo" },
    ],
  },
  {
    key: "text_media",
    label: "Text + image",
    description: "A story block: heading and paragraphs beside a photograph.",
    pages: "content",
    fields: ["eyebrow", "heading", "body", "cta", "media"],
    tones: ALL_TONES,
    layouts: [
      { value: "media-right", label: "Image right" },
      { value: "media-left", label: "Image left" },
    ],
  },
  {
    key: "statement",
    label: "Statement",
    description: "A bold heading with a short paragraph and an optional button.",
    pages: "content",
    fields: [...BASIC, "cta"],
    tones: ALL_TONES,
  },
  {
    key: "quote",
    label: "Quote / vision",
    description: "A large centred italic line — vision, mission or a testimonial.",
    pages: "content",
    fields: ["eyebrow", "heading", "body"],
    labels: { heading: "Quote", body: "Attribution / supporting line" },
    tones: ALL_TONES,
  },
  {
    key: "cta_band",
    label: "Call-to-action band",
    description: "Full-width coloured band with a heading and up to two buttons.",
    pages: "content",
    fields: [...BASIC, "cta", "cta2"],
    tones: ["ember", "ink", "cream"],
  },
  {
    key: "image_banner",
    label: "Image banner",
    description: "Full-bleed photograph with an overlaid heading and button.",
    pages: "content",
    fields: [...BASIC, "cta", "media"],
  },
  {
    key: "pillars",
    label: "Numbered pillars",
    description: "Numbered points with icons — values, reasons, capabilities.",
    pages: "content",
    fields: [...BASIC, "cta"],
    tones: ALL_TONES,
    layouts: [
      { value: "grid-3", label: "Three columns" },
      { value: "grid-2", label: "Two columns" },
      { value: "sticky", label: "Sticky heading + list" },
    ],
    items: { label: "Points", singular: "point", fields: ["title", "body", "icon", "href"] },
  },
  {
    key: "stats",
    label: "Numbers",
    description: "Big animated figures. Store figures can update automatically.",
    pages: "content",
    fields: ["eyebrow", "heading", "body"],
    tones: ["ink", "paper", "cream", "ember"],
    stats: true,
  },
  {
    key: "timeline",
    label: "Timeline",
    description: "Steps or milestones in a row, each with a date or label.",
    pages: "content",
    fields: BASIC,
    tones: ALL_TONES,
    items: { label: "Steps", singular: "step", fields: ["meta", "title", "body"], labels: { meta: "Date / label" } },
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Expandable questions and answers.",
    pages: "content",
    fields: ["eyebrow", "heading"],
    tones: ALL_TONES,
    items: { label: "Questions", singular: "question", fields: ["title", "body"], labels: { title: "Question", body: "Answer" } },
  },
  {
    key: "link_rows",
    label: "Big link rows",
    description: "Oversized rows that link to other pages — great as a closing band.",
    pages: "content",
    fields: ["eyebrow", "heading"],
    tones: ["ember", "ink", "paper"],
    items: { label: "Rows", singular: "row", fields: ["title", "body", "href"], labels: { href: "Link (required)" } },
  },
  {
    key: "image_gallery",
    label: "Photo gallery",
    description: "A masonry grid of photographs with a lightbox.",
    pages: "content",
    fields: ["eyebrow", "heading"],
    tones: ["paper", "cream", "ink"],
    items: { label: "Photos", singular: "photo", fields: ["media", "title"], labels: { title: "Caption" } },
  },

  /* ------------------------------------------------------ Page-specific blocks */
  {
    key: "home_hero",
    label: "Home hero",
    description: "Opening statement with one signature-dish panel per brand, the group film and a brand ticker.",
    pages: ["home"],
    fields: ["eyebrow", "heading", "body", "cta", "cta2", "media", "video"],
    labels: { media: "Film poster / group photo", video: "Group film (muted loop)" },
    help: {
      heading: "Put the phrase to underline in *asterisks*; a new line starts a new line of the headline.",
      video: "6–10 second muted MP4 loop. The poster image shows first and for visitors who prefer reduced motion.",
    },
    pinned: true,
    layouts: [
      { value: "panels", label: "Brand panels (signature dish per brand)" },
      { value: "3d", label: "With 3D brand objects" },
      { value: "classic", label: "Typography only" },
    ],
  },
  { key: "house_of_brands", label: "House of brands", description: "Stacking full-screen panels, one per brand.", pages: ["home"], fields: [...BASIC, "cta"], unique: true, dataLink: { label: "Edit brands", href: "/admin/r/brands" } },
  { key: "footprint", label: "India footprint", description: "Map of India with a dot per live store.", pages: ["home"], fields: [...BASIC, "cta"], unique: true, dataLink: { label: "Edit stores", href: "/admin/r/stores" } },
  { key: "founders_preview", label: "Founders preview", description: "Founder portraits linking to the About page.", pages: ["home"], fields: [...BASIC, "cta"], unique: true, dataLink: { label: "Edit founders", href: "/admin/r/founders" } },
  { key: "brand_rows", label: "Brand list", description: "Every brand as an editorial row with quick links.", pages: ["brands"], fields: [], unique: true, dataLink: { label: "Edit brands", href: "/admin/r/brands" } },
  { key: "brand_compare", label: "Brand comparison", description: "Table comparing format, ticket size and cities.", pages: ["brands"], fields: ["eyebrow", "heading"], unique: true, tones: ["cream", "paper"] },
  { key: "ownership_model", label: "Homegrown + franchise model", description: "Paragraphs beside a list of brands and their model.", pages: ["invest"], fields: BASIC, unique: true },
  { key: "brand_invest_links", label: "Brand investment cards", description: "Cards linking to each brand's investment section.", pages: ["invest"], fields: BASIC, unique: true },
  { key: "investor_form", label: "Investor enquiry form", description: "The group investor form (writes to the Investor sheet).", pages: ["invest"], fields: BASIC, unique: true, dataLink: { label: "Form settings", href: "/admin/r/forms" } },
  { key: "store_locator", label: "Store locator", description: "Map, filters, search and the store list.", pages: ["stores"], fields: [], unique: true, dataLink: { label: "Edit stores", href: "/admin/r/stores" } },
  { key: "milestones", label: "Milestones", description: "The company timeline.", pages: ["about"], fields: ["eyebrow", "heading"], unique: true, tones: ["cream", "paper"], dataLink: { label: "Edit milestones", href: "/admin/r/milestones" } },
  { key: "founders", label: "Founders", description: "Founder profiles with background and responsibility.", pages: ["about"], fields: BASIC, unique: true, dataLink: { label: "Edit founders", href: "/admin/r/founders" } },
  { key: "leadership", label: "Leadership", description: "Function heads beyond the founders.", pages: ["about"], fields: BASIC, unique: true, dataLink: { label: "Edit leadership", href: "/admin/r/leadership" } },
  { key: "csr_initiatives", label: "CSR initiatives", description: "Initiative stories with photographs.", pages: ["csr"], fields: BASIC, unique: true, tones: ["cream", "paper"], dataLink: { label: "Edit initiatives", href: "/admin/r/csr-initiatives" } },
  { key: "csr_gallery", label: "CSR photo grid", description: "All CSR photographs with a lightbox.", pages: ["csr"], fields: ["eyebrow", "heading"], unique: true, dataLink: { label: "Edit photographs", href: "/admin/r/csr-photos" } },
  { key: "csr_form", label: "CSR partner form", description: "Partner-with-us enquiry (General Enquiry sheet).", pages: ["csr"], fields: BASIC, unique: true },
  { key: "careers_gallery", label: "Life at Litensity", description: "Team photographs.", pages: ["careers"], fields: BASIC, unique: true, dataLink: { label: "Edit photographs", href: "/admin/r/careers-gallery" } },
  { key: "job_list", label: "Open roles", description: "Expandable list of published jobs.", pages: ["careers"], fields: BASIC, unique: true, dataLink: { label: "Edit roles", href: "/admin/r/jobs" } },
  { key: "career_form", label: "Application form", description: "Job application with résumé upload (Recruitment sheet).", pages: ["careers"], fields: BASIC, unique: true },
  { key: "contact_hq", label: "Office & contact channels", description: "Corporate address, phone, email and WhatsApp.", pages: ["contact"], fields: ["eyebrow"], unique: true, dataLink: { label: "Edit contact details", href: "/admin/r/settings" } },
  { key: "departments", label: "Departments", description: "Department-wise email and phone.", pages: ["contact"], fields: BASIC, unique: true, tones: ["cream", "paper"], dataLink: { label: "Edit departments", href: "/admin/r/departments" } },
  {
    key: "contact_form",
    label: "Enquiry form + shortcuts",
    description: "General enquiry form with shortcut links beside it.",
    pages: ["contact"],
    fields: ["eyebrow", "heading", "subheading", "body"],
    labels: { subheading: "Shortcuts title" },
    unique: true,
    items: { label: "Shortcuts", singular: "shortcut", fields: ["title", "body", "href"] },
  },

  /* ------------------------------------------- Brand pages (shared template) */
  { key: "brand_hero", label: "Brand hero", description: "Brand name/logo, tagline, hero image and buttons. Content comes from each brand.", pages: ["brand-template"], fields: ["cta", "cta2"], labels: { cta: "Button 1", cta2: "Button 2" }, pinned: true, dataLink: { label: "Edit brands", href: "/admin/r/brands" } },
  { key: "brand_story", label: "Story", description: "Each brand's story, pull quote and pillars.", pages: ["brand-template"], fields: ["eyebrow"], unique: true },
  { key: "brand_highlights", label: "Numbers", description: "Each brand's stats.", pages: ["brand-template"], fields: [], unique: true, dataLink: { label: "Edit stats", href: "/admin/r/stats?scope=brand" } },
  { key: "brand_menu", label: "Menu & offering", description: "Bestsellers, categories and products; menu download.", pages: ["brand-template"], fields: ["eyebrow", "heading", "body", "cta"], labels: { cta: "Download button" }, unique: true },
  { key: "brand_campaigns", label: "Campaigns & launches", description: "Horizontal rail of campaigns.", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_stores", label: "Stores", description: "Brand-filtered store locator.", pages: ["brand-template"], fields: ["eyebrow", "heading", "cta"], unique: true },
  { key: "brand_order", label: "Order online", description: "Delivery platform buttons.", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_gallery", label: "Gallery", description: "Store, product and campaign photographs.", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_downloads", label: "Downloads", description: "Menu and brochure behind OTP.", pages: ["brand-template"], fields: ["eyebrow", "heading", "body"], unique: true },
  { key: "brand_investment", label: "Investment intro + models", description: "Only on brands with the investment block switched on.", pages: ["brand-template"], fields: ["eyebrow", "subheading", "cta"], labels: { subheading: "Models title", cta: "Brochure button" }, unique: true },
  { key: "brand_support", label: "Investment support", description: "What partners get (investment brands only).", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_process", label: "Investment process", description: "Enquiry-to-opening steps (investment brands only).", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_faq", label: "Investment FAQ", description: "Partner questions (investment brands only).", pages: ["brand-template"], fields: ["eyebrow", "heading"], unique: true },
  { key: "brand_enquiry", label: "Enquiry form", description: "Franchise form on investment brands; customer enquiry on others.", pages: ["brand-template"], fields: BASIC, unique: true },
];

export const KIND_MAP = new Map(SECTION_KINDS.map((k) => [k.key, k]));

export function getKind(key: string): SectionKind | undefined {
  return KIND_MAP.get(key);
}

export function kindsForPage(pageKey: string): SectionKind[] {
  return SECTION_KINDS.filter((k) => (k.pages === "content" ? pageKey !== "brand-template" : k.pages.includes(pageKey)));
}

export const TONE_LABELS: Record<Tone, string> = {
  paper: "Warm paper",
  cream: "Cream",
  ink: "Dark ink",
  ember: "Ember orange",
  brand: "Brand colour",
};

export const PAGE_PATHS: Record<string, string> = {
  home: "/",
  brands: "/brands",
  "brand-template": "/brands/bigguys",
  invest: "/invest",
  stores: "/stores",
  about: "/about",
  csr: "/csr",
  careers: "/careers",
  contact: "/contact",
};
