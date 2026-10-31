import type { Field, Option, Resource } from "./types";
import { ICON_NAMES } from "@/components/ui/Icon";
import { LIST_DEFINITIONS, PAGE_DEFINITIONS } from "./content-model";

/* ---------------------------------------------------------------- helpers */

const STATUS_OPTIONS: Option[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const status = (defaultValue = "published"): Field => ({
  name: "status",
  label: "Status",
  type: "select",
  options: STATUS_OPTIONS,
  required: true,
  defaultValue,
  help: "Draft = only visible in preview. Published = live. Archived = hidden but kept.",
});

const sortOrder: Field = { name: "sort_order", label: "Order", type: "number", defaultValue: 0, help: "Lower numbers appear first." };

const brandRelation: Field["relation"] = { table: "brands", labelColumn: "name", orderBy: "sort_order" };
const brand = (required = true): Field => ({ name: "brand_id", label: "Brand", type: "relation", relation: brandRelation, required });

const media = (name: string, label: string, accept: Field["accept"] = "image", help?: string): Field => ({
  name,
  label,
  type: "media",
  accept,
  help,
});

const iconOptions: Option[] = [{ value: "", label: "— none —" }, ...ICON_NAMES.map((n) => ({ value: n, label: n }))];

const brandFilter = { name: "brand_id", label: "Brand", relation: brandRelation };
const statusFilter = { name: "status", label: "Status", options: STATUS_OPTIONS };

/* --------------------------------------------------------------- registry */

export const RESOURCES: Resource[] = [
  /* ---------------- Content ---------------- */
  {
    key: "page-sections",
    hidden: true,
    table: "page_sections",
    label: "Page sections",
    singular: "Section",
    group: "Content",
    description: "Headings, copy, CTAs and imagery for every fixed section of the site.",
    titleField: "section_key",
    list: [
      { name: "section_key", label: "Section" },
      { name: "page_key", label: "Page" },
      { name: "heading", label: "Heading" },
      { name: "is_enabled", label: "Shown", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    search: ["heading", "eyebrow", "body"],
    filters: [{ name: "page_key", label: "Page", options: PAGE_DEFINITIONS.map((p) => ({ value: p.key, label: p.name })) }, statusFilter],
    orderBy: [{ column: "page_key" }, { column: "section_key" }],
    canCreate: false,
    canDelete: false,
    preview: (row) => PAGE_DEFINITIONS.find((p) => p.key === row.page_key)?.path ?? null,
    groups: [
      {
        title: "Copy",
        description: "Wrap words in *asterisks* to set them in italic accent. A new line in a heading forces a line break.",
        fields: [
          { name: "eyebrow", label: "Eyebrow / label", type: "text" },
          { name: "heading", label: "Heading", type: "textarea" },
          { name: "subheading", label: "Subheading", type: "text" },
          { name: "body", label: "Body", type: "textarea", full: true, help: "Separate paragraphs with a blank line." },
        ],
      },
      {
        title: "Calls to action",
        fields: [
          { name: "cta_label", label: "Primary CTA label", type: "text" },
          { name: "cta_href", label: "Primary CTA link", type: "text", placeholder: "/invest or https://…" },
          { name: "cta2_label", label: "Secondary CTA label", type: "text" },
          { name: "cta2_href", label: "Secondary CTA link", type: "text" },
        ],
      },
      {
        title: "Media & visibility",
        fields: [
          media("media_id", "Image", "image"),
          media("video_media_id", "Video (optional, replaces image)", "video"),
          { name: "is_enabled", label: "Show this section", type: "boolean", defaultValue: true },
          status(),
        ],
      },
    ],
  },
  {
    key: "lists",
    hidden: true,
    table: "content_items",
    label: "Repeatable lists",
    singular: "List item",
    group: "Content",
    description: "Pillars, values, capabilities, roadmap, investment support and process steps, careers perks, CSR focus areas.",
    titleField: "title",
    list: [
      { name: "list_key", label: "List" },
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "title", label: "Title" },
      { name: "status", label: "Status", format: "status" },
    ],
    search: ["title", "body"],
    filters: [{ name: "list_key", label: "List", options: LIST_DEFINITIONS.map((l) => ({ value: l.key, label: l.label })) }, brandFilter, statusFilter],
    orderBy: [{ column: "list_key" }, { column: "sort_order" }],
    sortable: true,
    groups: [
      {
        title: "Item",
        fields: [
          { name: "list_key", label: "List", type: "select", required: true, options: LIST_DEFINITIONS.map((l) => ({ value: l.key, label: l.label })) },
          { ...brand(false), help: "Only for brand-specific lists (brand pillars, support, process)." },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Description", type: "textarea", full: true },
          { name: "meta", label: "Side note", type: "text", help: "E.g. a duration for process steps or a year for roadmap items." },
          { name: "href", label: "Link", type: "text", help: "Optional — makes the item clickable." },
          { name: "icon", label: "Icon", type: "select", options: iconOptions },
          media("media_id", "Image (optional)"),
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "stats",
    hidden: true,
    table: "stats",
    label: "Highlights & stats",
    singular: "Stat",
    group: "Content",
    description: "Numbers shown on the home page, brand pages, Invest and CSR. Store-based numbers can be computed automatically from the Store Master.",
    titleField: "label",
    list: [
      { name: "scope", label: "Where" },
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "label", label: "Label" },
      { name: "source", label: "Source" },
      { name: "value", label: "Value" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [
      {
        name: "scope",
        label: "Where",
        options: [
          { value: "home", label: "Home" },
          { value: "brand", label: "Brand page" },
          { value: "invest", label: "Invest" },
          { value: "csr", label: "CSR" },
        ],
      },
      brandFilter,
    ],
    orderBy: [{ column: "scope" }, { column: "sort_order" }],
    sortable: true,
    groups: [
      {
        title: "Stat",
        description: "Never publish a figure Litensity has not confirmed. Leave the value empty to hide the stat.",
        fields: [
          {
            name: "scope",
            label: "Where",
            type: "select",
            required: true,
            options: [
              { value: "home", label: "Home" },
              { value: "brand", label: "Brand page" },
              { value: "invest", label: "Invest" },
              { value: "csr", label: "CSR" },
            ],
          },
          { ...brand(false), help: "Required for brand-page stats." },
          { name: "label", label: "Label", type: "text", required: true },
          {
            name: "source",
            label: "Source",
            type: "select",
            required: true,
            defaultValue: "manual",
            options: [
              { value: "manual", label: "Manual value" },
              { value: "stores_live", label: "Auto — stores (live + opening soon)" },
              { value: "cities", label: "Auto — cities" },
              { value: "states", label: "Auto — states" },
              { value: "brands", label: "Auto — published brands" },
            ],
          },
          { name: "value", label: "Value (manual only)", type: "text", placeholder: "e.g. 120" },
          { name: "suffix", label: "Suffix", type: "text", placeholder: "e.g. + or K" },
          { name: "note", label: "Footnote", type: "text" },
          sortOrder,
          status(),
        ],
      },
    ],
  },

  /* ---------------- Brands ---------------- */
  {
    key: "brands",
    table: "brands",
    label: "Brands",
    singular: "Brand",
    group: "Brands",
    description: "Each brand renders through the same brand template. Feature switches decide which blocks appear.",
    titleField: "name",
    list: [
      { name: "logo_media_id", label: "", format: "media" },
      { name: "name", label: "Name" },
      { name: "slug", label: "URL" },
      { name: "ownership", label: "Model" },
      { name: "color_primary", label: "Colour", format: "color" },
      { name: "feature_investment", label: "Investment", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    search: ["name", "slug"],
    orderBy: [{ column: "sort_order" }],
    sortable: true,
    preview: (row) => `/brands/${row.slug}`,
    children: [
      { resource: "product-categories", foreignKey: "brand_id", title: "Menu categories" },
      { resource: "products", foreignKey: "brand_id", title: "Products" },
      { resource: "campaigns", foreignKey: "brand_id", title: "Campaigns & launches" },
      { resource: "brand-gallery", foreignKey: "brand_id", title: "Gallery" },
      { resource: "delivery-links", foreignKey: "brand_id", title: "Order / delivery links" },
      { resource: "downloads", foreignKey: "brand_id", title: "Menu & brochure files" },
      { resource: "investment-models", foreignKey: "brand_id", title: "Investment models" },
      { resource: "brand-faqs", foreignKey: "brand_id", title: "Investment FAQs" },
      { resource: "brand-pillars", foreignKey: "brand_id", title: "Story pillars" },
      { resource: "brand-stats", foreignKey: "brand_id", title: "Brand numbers" },
      { resource: "brand-support", foreignKey: "brand_id", title: "Investment support" },
      { resource: "brand-process", foreignKey: "brand_id", title: "Enquiry-to-opening steps" },
    ],
    groups: [
      {
        title: "Identity",
        fields: [
          { name: "name", label: "Brand name", type: "text", required: true },
          { name: "slug", label: "URL slug", type: "text", required: true, createOnly: true, help: "Lowercase letters, numbers and hyphens. Becomes /brands/slug." },
          {
            name: "ownership",
            label: "Model",
            type: "select",
            required: true,
            options: [
              { value: "homegrown", label: "Homegrown" },
              { value: "franchise", label: "Franchise" },
            ],
          },
          { name: "category", label: "Category", type: "text", placeholder: "Fried chicken · QSR" },
          { name: "tagline", label: "Tagline", type: "text", full: true },
          { name: "positioning", label: "One-line positioning", type: "text", full: true },
          media("logo_media_id", "Logo", "image", "SVG or transparent PNG for light backgrounds. Shown on the brand hub and cards."),
          media("logo_reverse_media_id", "Logo on brand colour", "image", "Version legible on the primary colour, shown in the brand hero. Leave empty to reuse the logo above."),
          media("hero_media_id", "Hero image"),
          media("hero_video_media_id", "Hero video (optional)", "video"),
          media("card_media_id", "Card image", "image", "Used on the home page and brand hub."),
        ],
      },
      {
        title: "Look & feel",
        fields: [
          { name: "color_primary", label: "Primary colour", type: "color", required: true },
          { name: "color_ink", label: "Ink (dark) colour", type: "color", required: true },
          { name: "color_surface", label: "Surface (light) colour", type: "color", required: true },
          {
            name: "typeface",
            label: "Display typeface",
            type: "select",
            options: [
              { value: "serif", label: "Editorial serif" },
              { value: "condensed", label: "Bold condensed" },
              { value: "grotesk", label: "Playful grotesk" },
            ],
          },
          {
            name: "hero_object",
            label: "3D hero object",
            type: "select",
            required: true,
            defaultValue: "none",
            help: "An interactive 3D object shown in the brand hero and on the home page. Turns itself off for reduced-motion users and low-power devices.",
            options: [
              { value: "none", label: "None" },
              { value: "chicken", label: "Glazed drumstick" },
              { value: "waffle", label: "Waffle with drizzle" },
              { value: "donut", label: "Iced donut" },
            ],
          },
        ],
      },
      {
        title: "Story",
        fields: [
          { name: "story_heading", label: "Story heading", type: "text", full: true },
          { name: "story_body", label: "Story", type: "textarea", full: true, help: "Origin, category and differentiation. Blank lines separate paragraphs." },
          { name: "differentiation", label: "Pull quote / differentiator", type: "textarea", full: true },
          { name: "format_summary", label: "Formats", type: "text", help: "Shown in the brand comparison strip." },
          { name: "ticket_size_label", label: "Ticket size (comparison strip)", type: "text", help: "Shown only when confirmed below." },
          { name: "ticket_size_confirmed", label: "Ticket size confirmed in writing by Litensity", type: "boolean" },
          { name: "external_url", label: "External website", type: "url" },
          { name: "external_url_enabled", label: "Link to external website", type: "boolean" },
        ],
      },
      {
        title: "Features",
        description: "Brochure and the brand investment enquiry only work when the investment block is on.",
        fields: [
          { name: "feature_menu_download", label: "Menu download (OTP)", type: "boolean", defaultValue: true },
          { name: "feature_investment", label: "Investment / franchise block", type: "boolean" },
          { name: "feature_brochure_download", label: "Franchise brochure download", type: "boolean" },
          { name: "feature_investment_enquiry", label: "Brand investment enquiry form", type: "boolean" },
        ],
      },
      {
        title: "Investment block",
        fields: [
          { name: "investment_heading", label: "Investment heading", type: "text", full: true },
          { name: "investment_intro", label: "Investment intro", type: "textarea", full: true },
          {
            name: "investment_field",
            label: "Enquiry asks for",
            type: "select",
            options: [
              { value: "preferred_location", label: "Preferred location (free text)" },
              { value: "preferred_format", label: "Preferred format (choice)" },
            ],
          },
          { name: "investment_format_options", label: "Format choices", type: "tags", help: "One per line." },
        ],
      },
      { title: "Publishing", fields: [sortOrder, status("draft")] },
    ],
  },
  {
    key: "product-categories",
    table: "product_categories",
    label: "Menu categories",
    singular: "Category",
    group: "Brands",
    hidden: true,
    titleField: "name",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "name", label: "Category" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    sortable: true,
    groups: [
      {
        title: "Category",
        fields: [brand(), { name: "name", label: "Name", type: "text", required: true }, { name: "description", label: "Description", type: "textarea", full: true }, media("media_id", "Image"), sortOrder, status()],
      },
    ],
  },
  {
    key: "products",
    table: "products",
    label: "Products",
    singular: "Product",
    group: "Brands",
    hidden: true,
    titleField: "name",
    list: [
      { name: "media_id", label: "", format: "media" },
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "category_id", label: "Category", format: "relation" },
      { name: "name", label: "Product" },
      { name: "is_bestseller", label: "Bestseller", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    search: ["name", "description"],
    filters: [brandFilter, statusFilter],
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    sortable: true,
    groups: [
      {
        title: "Product",
        fields: [
          brand(),
          { name: "category_id", label: "Category", type: "relation", relation: { table: "product_categories", labelColumn: "name", orderBy: "sort_order" } },
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea", full: true },
          { name: "price_label", label: "Price", type: "text", placeholder: "₹249" },
          { name: "is_bestseller", label: "Bestseller", type: "boolean" },
          {
            name: "is_veg",
            label: "Diet marker",
            type: "select",
            options: [
              { value: "", label: "Not shown" },
              { value: "true", label: "Vegetarian" },
              { value: "false", label: "Non-vegetarian" },
            ],
          },
          media("media_id", "Photo"),
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "campaigns",
    table: "campaigns",
    label: "Campaigns & launches",
    singular: "Campaign",
    group: "Brands",
    hidden: true,
    titleField: "title",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "kind", label: "Type" },
      { name: "title", label: "Title" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: "Campaign",
        fields: [
          brand(),
          {
            name: "kind",
            label: "Type",
            type: "select",
            options: [
              { value: "campaign", label: "Campaign" },
              { value: "launch", label: "New launch" },
              { value: "programme", label: "Programme (e.g. loyalty)" },
            ],
          },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Description", type: "textarea", full: true },
          media("media_id", "Visual"),
          { name: "cta_label", label: "CTA label", type: "text" },
          { name: "cta_href", label: "CTA link", type: "text" },
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "brand-gallery",
    table: "gallery_items",
    label: "Brand gallery",
    singular: "Gallery image",
    group: "Brands",
    hidden: true,
    scope: { collection: "brand" },
    titleField: "caption",
    list: [
      { name: "media_id", label: "", format: "media" },
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "caption", label: "Caption" },
      { name: "tag", label: "Tag" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: "Image",
        fields: [
          brand(),
          { ...media("media_id", "Image"), required: true },
          { name: "caption", label: "Caption", type: "text", full: true },
          { name: "tag", label: "Tag", type: "text", placeholder: "Store · Product · Campaign" },
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "delivery-links",
    table: "delivery_links",
    label: "Order / delivery links",
    singular: "Link",
    group: "Brands",
    hidden: true,
    titleField: "platform",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "platform", label: "Platform" },
      { name: "url", label: "URL" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: "Link",
        fields: [brand(), { name: "platform", label: "Platform", type: "text", required: true, placeholder: "Swiggy" }, { name: "url", label: "URL", type: "url", required: true }, sortOrder, status()],
      },
    ],
  },
  {
    key: "downloads",
    table: "downloads",
    label: "Menu & brochure files",
    singular: "Download",
    group: "Brands",
    hidden: true,
    titleField: "title",
    description: "Files are stored privately and only released after OTP verification.",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "kind", label: "Type" },
      { name: "title", label: "Title" },
      { name: "requires_otp", label: "OTP", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    orderBy: [{ column: "brand_id" }, { column: "kind" }],
    groups: [
      {
        title: "File",
        description: "Brochures only appear for brands with the investment block and brochure switch turned on.",
        fields: [
          brand(),
          {
            name: "kind",
            label: "Type",
            type: "select",
            required: true,
            options: [
              { value: "menu", label: "Menu" },
              { value: "brochure", label: "Franchise brochure" },
            ],
          },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea", full: true },
          { ...media("file_media_id", "PDF file", "document"), required: true },
          { name: "requires_otp", label: "Require OTP verification", type: "boolean", defaultValue: true },
          status("draft"),
        ],
      },
    ],
  },
  {
    key: "investment-models",
    table: "investment_models",
    label: "Investment models",
    singular: "Model",
    group: "Investment",
    titleField: "name",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "name", label: "Model" },
      { name: "figures_confirmed", label: "Figures confirmed", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter, statusFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    preview: () => null,
    groups: [
      {
        title: "Model",
        fields: [
          brand(),
          { name: "name", label: "Name", type: "text", required: true },
          { name: "format", label: "Format", type: "text" },
          { name: "description", label: "Description", type: "textarea", full: true },
          { name: "includes", label: "What it includes", type: "tags", help: "One item per line." },
        ],
      },
      {
        title: "Commercial figures",
        description: "These never appear on the website until “Figures confirmed in writing” is ticked.",
        fields: [
          { name: "investment_range", label: "Indicative investment range", type: "text" },
          { name: "area_requirement", label: "Area / site requirement", type: "text" },
          { name: "payback_range", label: "Payback (range)", type: "text" },
          { name: "return_range", label: "Return expectations (range)", type: "text" },
          { name: "assumptions", label: "Assumptions", type: "textarea", full: true },
          { name: "figures_confirmed", label: "Figures confirmed in writing by Litensity", type: "boolean" },
        ],
      },
      { title: "Publishing", fields: [sortOrder, status("draft")] },
    ],
  },
  {
    key: "brand-faqs",
    table: "faqs",
    label: "Brand investment FAQs",
    singular: "FAQ",
    group: "Investment",
    scope: { scope: "brand_investment" },
    titleField: "question",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "question", label: "Question" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter, statusFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: "FAQ",
        fields: [brand(), { name: "question", label: "Question", type: "text", required: true, full: true }, { name: "answer", label: "Answer", type: "textarea", required: true, full: true }, sortOrder, status("draft")],
      },
    ],
  },

  /* ---------------- Stores ---------------- */
  {
    key: "stores",
    table: "stores",
    label: "Store Master",
    singular: "Store",
    group: "Stores",
    description: "The single source of truth for the map, store lists, brand pages, filters and counts.",
    titleField: "name",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "name", label: "Store" },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "store_status", label: "Status" },
      { name: "is_archived", label: "Archived", format: "boolean" },
    ],
    search: ["name", "city", "state", "pincode", "locality", "address"],
    filters: [
      brandFilter,
      {
        name: "store_status",
        label: "Status",
        options: [
          { value: "live", label: "Live" },
          { value: "opening_soon", label: "Opening soon" },
        ],
      },
      {
        name: "is_archived",
        label: "Archived",
        options: [
          { value: "false", label: "Active" },
          { value: "true", label: "Archived" },
        ],
      },
    ],
    orderBy: [{ column: "state" }, { column: "city" }, { column: "name" }],
    preview: () => "/stores",
    children: [{ resource: "store-order-links", foreignKey: "store_id", title: "Order online links" }],
    groups: [
      {
        title: "Store",
        fields: [
          brand(),
          { name: "name", label: "Store name", type: "text", required: true },
          {
            name: "store_status",
            label: "Status",
            type: "select",
            required: true,
            defaultValue: "live",
            options: [
              { value: "live", label: "Live — shown on the map" },
              { value: "opening_soon", label: "Opening soon — listed, not pinned" },
            ],
          },
          { name: "phone", label: "Contact number", type: "text", required: true, placeholder: "+91 98765 43210" },
          media("photo_media_id", "Store photograph"),
          { name: "is_archived", label: "Archived (hidden everywhere)", type: "boolean" },
        ],
      },
      {
        title: "Address & location",
        description: "Tip: right-click the store in Google Maps to copy its latitude and longitude.",
        fields: [
          { name: "address", label: "Full address", type: "textarea", required: true, full: true },
          { name: "locality", label: "Locality / area", type: "text" },
          { name: "city", label: "City", type: "text", required: true },
          { name: "state", label: "State", type: "text", required: true },
          { name: "pincode", label: "Pincode", type: "text", required: true },
          { name: "latitude", label: "Latitude", type: "number", required: true },
          { name: "longitude", label: "Longitude", type: "number", required: true },
        ],
      },
      {
        title: "Opening hours",
        fields: [
          { name: "hours", label: "Weekly hours", type: "hours", full: true },
          { name: "hours_note", label: "Hours note", type: "text", full: true, placeholder: "e.g. Delivery till 2am on weekends" },
        ],
      },
    ],
  },
  {
    key: "store-order-links",
    table: "store_order_links",
    label: "Store order links",
    singular: "Order link",
    group: "Stores",
    hidden: true,
    titleField: "platform",
    list: [
      { name: "platform", label: "Platform" },
      { name: "url", label: "URL" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    groups: [
      {
        title: "Link",
        fields: [
          { name: "store_id", label: "Store", type: "relation", relation: { table: "stores", labelColumn: "name", orderBy: "name" }, required: true },
          { name: "platform", label: "Platform", type: "text", required: true, placeholder: "Zomato" },
          { name: "url", label: "URL", type: "url", required: true },
          sortOrder,
        ],
      },
    ],
  },

  /* ---------------- People ---------------- */
  {
    key: "founders",
    table: "people",
    label: "Founders",
    singular: "Founder",
    group: "About",
    scope: { kind: "founder" },
    titleField: "name",
    list: [
      { name: "photo_media_id", label: "", format: "media" },
      { name: "name", label: "Name" },
      { name: "designation", label: "Designation" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    preview: () => "/about#founders",
    groups: [personFields()],
  },
  {
    key: "leadership",
    table: "people",
    label: "Leadership",
    singular: "Leader",
    group: "About",
    scope: { kind: "leader" },
    titleField: "name",
    list: [
      { name: "photo_media_id", label: "", format: "media" },
      { name: "name", label: "Name" },
      { name: "designation", label: "Role" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    preview: () => "/about#leadership",
    groups: [personFields()],
  },
  {
    key: "milestones",
    table: "milestones",
    label: "Milestones",
    singular: "Milestone",
    group: "About",
    titleField: "title",
    list: [
      { name: "year_label", label: "Year" },
      { name: "title", label: "Title" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    preview: () => "/about",
    groups: [
      {
        title: "Milestone",
        fields: [
          { name: "year_label", label: "Year / date", type: "text", required: true },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Description", type: "textarea", full: true },
          media("media_id", "Image"),
          sortOrder,
          status(),
        ],
      },
    ],
  },

  /* ---------------- CSR ---------------- */
  {
    key: "csr-initiatives",
    table: "csr_initiatives",
    label: "CSR initiatives",
    singular: "Initiative",
    group: "CSR",
    titleField: "title",
    list: [
      { name: "title", label: "Initiative" },
      { name: "location", label: "Location" },
      { name: "event_date", label: "Date", format: "date" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    preview: () => "/csr",
    children: [{ resource: "csr-photos", foreignKey: "csr_initiative_id", title: "Photographs" }],
    groups: [
      {
        title: "Initiative",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, full: true },
          { name: "location", label: "Location", type: "text" },
          { name: "event_date", label: "Date", type: "date" },
          { name: "description", label: "Description", type: "textarea", full: true },
          sortOrder,
          status("draft"),
        ],
      },
    ],
  },
  {
    key: "csr-photos",
    table: "gallery_items",
    label: "CSR photographs",
    singular: "Photograph",
    group: "CSR",
    scope: { collection: "csr" },
    titleField: "caption",
    list: [
      { name: "media_id", label: "", format: "media" },
      { name: "csr_initiative_id", label: "Initiative", format: "relation" },
      { name: "caption", label: "Caption" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    groups: [
      {
        title: "Photograph",
        fields: [
          {
            name: "csr_initiative_id",
            label: "Initiative",
            type: "relation",
            relation: { table: "csr_initiatives", labelColumn: "title", orderBy: "sort_order" },
            help: "Leave empty for the general CSR gallery.",
          },
          { ...media("media_id", "Photograph"), required: true },
          { name: "caption", label: "Caption", type: "text", full: true },
          sortOrder,
          status(),
        ],
      },
    ],
  },

  /* ---------------- Careers ---------------- */
  {
    key: "jobs",
    table: "jobs",
    label: "Open roles",
    singular: "Role",
    group: "Careers",
    titleField: "title",
    list: [
      { name: "title", label: "Role" },
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "location", label: "Location" },
      { name: "is_open", label: "Open", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    search: ["title", "location"],
    filters: [brandFilter, statusFilter],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    preview: () => "/careers#roles",
    groups: [
      {
        title: "Role",
        fields: [
          { name: "title", label: "Job title", type: "text", required: true },
          { ...brand(false), help: "Leave empty for group roles." },
          { name: "location", label: "Location", type: "text", required: true },
          { name: "employment_type", label: "Type", type: "text", placeholder: "Full-time" },
          { name: "summary", label: "Summary", type: "textarea", full: true },
          { name: "description", label: "Description", type: "textarea", full: true },
          { name: "requirements", label: "Requirements", type: "textarea", full: true },
          { name: "is_open", label: "Accepting applications", type: "boolean", defaultValue: true },
          sortOrder,
          status("draft"),
        ],
      },
    ],
  },
  {
    key: "careers-gallery",
    table: "gallery_items",
    label: "Life at Litensity",
    singular: "Photograph",
    group: "Careers",
    scope: { collection: "careers" },
    titleField: "caption",
    list: [
      { name: "media_id", label: "", format: "media" },
      { name: "caption", label: "Caption" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    groups: [
      {
        title: "Photograph",
        fields: [{ ...media("media_id", "Photograph"), required: true }, { name: "caption", label: "Caption", type: "text", full: true }, sortOrder, status()],
      },
    ],
  },

  /* ---------------- Media ---------------- */
  {
    key: "media",
    table: "media",
    label: "Media library",
    singular: "Asset",
    group: "Media",
    titleField: "path",
    list: [
      { name: "id", label: "", format: "media" },
      { name: "title", label: "Title" },
      { name: "kind", label: "Type" },
      { name: "bucket", label: "Storage" },
      { name: "alt", label: "Alt text" },
    ],
    search: ["title", "alt", "path"],
    filters: [
      {
        name: "kind",
        label: "Type",
        options: [
          { value: "image", label: "Images" },
          { value: "video", label: "Videos" },
          { value: "document", label: "Documents" },
        ],
      },
    ],
    orderBy: [{ column: "created_at", ascending: false }],
    canCreate: false,
    groups: [
      {
        title: "Asset",
        description: "Alt text describes the image for screen readers and search engines.",
        fields: [
          { name: "title", label: "Title", type: "text", full: true },
          { name: "alt", label: "Alt text", type: "text", full: true },
          { name: "path", label: "File", type: "text", readOnly: true, full: true },
          { name: "mime_type", label: "Format", type: "text", readOnly: true },
          { name: "size_bytes", label: "Size (bytes)", type: "number", readOnly: true },
        ],
      },
    ],
  },

  /* ---------------- SEO & Settings ---------------- */
  {
    key: "seo",
    table: "seo_metadata",
    label: "SEO",
    singular: "SEO entry",
    group: "SEO",
    description: "Titles, descriptions and social previews per page. Brand pages use brand:<slug>.",
    primaryKey: "route_key",
    titleField: "route_key",
    list: [
      { name: "route_key", label: "Page" },
      { name: "title", label: "Title" },
      { name: "noindex", label: "Hidden from search", format: "boolean" },
    ],
    search: ["route_key", "title"],
    orderBy: [{ column: "route_key" }],
    groups: [
      {
        title: "Search",
        fields: [
          { name: "route_key", label: "Page key", type: "text", required: true, createOnly: true, help: "e.g. home, invest, brand:bigguys" },
          { name: "title", label: "Title", type: "text", full: true, help: "~50–60 characters." },
          { name: "description", label: "Meta description", type: "textarea", full: true, help: "~150–160 characters." },
          { name: "canonical_path", label: "Canonical path", type: "text", placeholder: "/invest" },
          { name: "noindex", label: "Hide from search engines", type: "boolean" },
        ],
      },
      {
        title: "Social preview",
        fields: [
          { name: "og_title", label: "Social title", type: "text", full: true },
          { name: "og_description", label: "Social description", type: "textarea", full: true },
          media("og_media_id", "Social image (1200×630)"),
        ],
      },
    ],
  },
  {
    key: "settings",
    table: "site_settings",
    label: "Global settings",
    singular: "Settings",
    group: "Settings",
    singleton: true,
    titleField: "company_name",
    list: [{ name: "company_name", label: "Company" }],
    canCreate: false,
    canDelete: false,
    groups: [
      {
        title: "Company",
        fields: [
          { name: "company_name", label: "Short name", type: "text", required: true },
          { name: "legal_name", label: "Legal name", type: "text", required: true },
          { name: "positioning_line", label: "Positioning line", type: "text", full: true },
          media("logo_media_id", "Logo (header)", "image", "Leave empty to use the typographic wordmark."),
          media("default_og_media_id", "Default social preview image (1200×630)"),
        ],
      },
      {
        title: "Contact",
        fields: [
          { name: "address", label: "Corporate address", type: "textarea", full: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "whatsapp_number", label: "WhatsApp number", type: "text", placeholder: "+91…" },
          { name: "whatsapp_message", label: "WhatsApp greeting", type: "text" },
          { name: "map_url", label: "Map link", type: "url" },
          { name: "latitude", label: "Office latitude", type: "number" },
          { name: "longitude", label: "Office longitude", type: "number" },
        ],
      },
      {
        title: "Header & footer",
        fields: [
          { name: "enquire_label", label: "Sticky Enquire label", type: "text", required: true },
          { name: "enquire_href", label: "Sticky Enquire link", type: "text", required: true },
          { name: "footer_statement", label: "Footer statement", type: "text", full: true },
          { name: "newsletter_enabled", label: "Show updates signup", type: "boolean" },
          { name: "newsletter_heading", label: "Signup text", type: "text", full: true },
        ],
      },
      {
        title: "Analytics",
        fields: [{ name: "analytics_measurement_id", label: "Google Analytics 4 ID", type: "text", placeholder: "G-XXXXXXX" }],
      },
    ],
  },
  {
    key: "navigation",
    table: "navigation_items",
    label: "Navigation",
    singular: "Menu link",
    group: "Settings",
    titleField: "label",
    list: [
      { name: "location", label: "Menu" },
      { name: "label", label: "Label" },
      { name: "href", label: "Link" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [
      {
        name: "location",
        label: "Menu",
        options: [
          { value: "header", label: "Header" },
          { value: "footer_explore", label: "Footer — explore" },
          { value: "footer_legal", label: "Footer — legal" },
        ],
      },
    ],
    sortable: true,
    orderBy: [{ column: "location" }, { column: "sort_order" }],
    groups: [
      {
        title: "Link",
        fields: [
          {
            name: "location",
            label: "Menu",
            type: "select",
            required: true,
            options: [
              { value: "header", label: "Header" },
              { value: "footer_explore", label: "Footer — explore" },
              { value: "footer_legal", label: "Footer — legal" },
            ],
          },
          { name: "label", label: "Label", type: "text", required: true },
          { name: "href", label: "Link", type: "text", required: true },
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "social",
    table: "social_links",
    label: "Social links",
    singular: "Social link",
    group: "Settings",
    titleField: "platform",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "platform", label: "Platform" },
      { name: "url", label: "URL" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    groups: [
      {
        title: "Social link",
        fields: [
          { ...brand(false), help: "Leave empty for Litensity group handles." },
          {
            name: "platform",
            label: "Platform",
            type: "select",
            required: true,
            options: ["instagram", "facebook", "linkedin", "youtube", "x"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
          },
          { name: "url", label: "URL", type: "url", required: true },
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "departments",
    table: "contact_departments",
    label: "Contact departments",
    singular: "Department",
    group: "Settings",
    titleField: "name",
    list: [
      { name: "name", label: "Department" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "status", label: "Status", format: "status" },
    ],
    sortable: true,
    orderBy: [{ column: "sort_order" }],
    groups: [
      {
        title: "Department",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "text", full: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
          {
            name: "enquiry_types",
            label: "Receives these enquiry types",
            type: "tags",
            full: true,
            help: "One per line, matching Settings → Forms → General Enquiry types (e.g. CSR partnership, Media). This department's email is alerted for them.",
          },
          sortOrder,
          status(),
        ],
      },
    ],
  },
  {
    key: "forms",
    table: "form_settings",
    label: "Forms & lead routing",
    singular: "Form",
    group: "Settings",
    description: "Email recipients, acknowledgement copy and option lists for every form.",
    primaryKey: "form_key",
    titleField: "label",
    list: [
      { name: "label", label: "Form" },
      { name: "is_enabled", label: "Enabled", format: "boolean" },
    ],
    canCreate: false,
    canDelete: false,
    orderBy: [{ column: "form_key" }],
    groups: [
      {
        title: "Routing",
        description: "Every submission is saved in Leads and emailed to the internal recipients below.",
        fields: [
          { name: "label", label: "Name", type: "text", required: true },
          { name: "notify_emails", label: "Internal recipients", type: "tags", help: "One email per line." },
          { name: "is_enabled", label: "Form accepting submissions", type: "boolean" },
        ],
      },
      {
        title: "Visitor acknowledgement",
        description: "Placeholders: {name}, {brand}, {file}.",
        fields: [
          { name: "ack_subject", label: "Email subject", type: "text", full: true },
          { name: "ack_body", label: "Email message", type: "textarea", full: true },
          { name: "success_message", label: "On-screen success message", type: "text", full: true },
          {
            name: "consent_label",
            label: "Consent checkbox wording",
            type: "textarea",
            full: true,
            help: "Downloads form only. Wording supplied by Litensity for contact and marketing follow-up.",
          },
        ],
      },
      {
        title: "Options",
        description: "One option per line.",
        fields: [
          { name: "budget_options", label: "Budget ranges", type: "tags" },
          { name: "timeline_options", label: "Timelines", type: "tags" },
          { name: "ticket_size_options", label: "Ticket sizes", type: "tags" },
          { name: "enquiry_types", label: "Enquiry types", type: "tags" },
        ],
      },
    ],
  },
  {
    key: "legal",
    table: "legal_documents",
    label: "Legal pages",
    singular: "Legal page",
    group: "Settings",
    primaryKey: "slug",
    titleField: "title",
    list: [
      { name: "title", label: "Page" },
      { name: "updated_at", label: "Updated", format: "date" },
      { name: "status", label: "Status", format: "status" },
    ],
    canCreate: false,
    canDelete: false,
    orderBy: [{ column: "slug" }],
    preview: (row) => `/${row.slug}`,
    groups: [
      {
        title: "Document",
        description: "Formatting: ## Heading, ### Subheading, - bullet, 1. numbered, **bold**, [link](https://…).",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Content", type: "markdown", required: true, full: true },
          status(),
        ],
      },
    ],
  },

  /* ---------------- Leads (read-only log) ---------------- */
  {
    key: "leads",
    table: "lead_submissions",
    label: "Lead delivery log",
    singular: "Lead",
    group: "Leads",
    description: "Every form submission and whether its emails were sent. Use Export to Excel to download them.",
    titleField: "email",
    readOnly: true,
    canCreate: false,
    canDelete: true,
    list: [
      { name: "created_at", label: "Received", format: "date" },
      { name: "form_key", label: "Form" },
      { name: "brand_slug", label: "Brand" },
      { name: "email", label: "Email" },
      { name: "email_status", label: "Email", format: "status" },
    ],
    search: ["email", "phone", "source_page"],
    filters: [
      {
        name: "form_key",
        label: "Form",
        options: ["franchise", "downloads", "investor", "recruitment", "general"].map((v) => ({ value: v, label: v })),
      },
      {
        name: "email_status",
        label: "Email",
        options: ["sent", "failed", "skipped", "pending"].map((v) => ({ value: v, label: v })),
      },
    ],
    orderBy: [{ column: "created_at", ascending: false }],
    groups: [
      {
        title: "Submission",
        fields: [
          { name: "form_key", label: "Form", type: "text", readOnly: true },
          { name: "brand_slug", label: "Brand", type: "text", readOnly: true },
          { name: "source_page", label: "Source page", type: "text", readOnly: true },
          { name: "email", label: "Email", type: "text", readOnly: true },
          { name: "phone", label: "Phone", type: "text", readOnly: true },
          { name: "email_status", label: "Email status", type: "text", readOnly: true },
          { name: "email_error", label: "Email error", type: "text", readOnly: true, full: true },
        ],
      },
    ],
  },
];

function personFields() {
  return {
    title: "Profile",
    description: "Portraits use a consistent 4:5 crop. Upload at least 1200×1500.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text" },
      media("photo_media_id", "Portrait"),
      { name: "linkedin_url", label: "LinkedIn", type: "url" },
      { name: "instagram_url", label: "Instagram", type: "url" },
      { name: "background", label: "Professional background", type: "textarea", full: true },
      { name: "responsibility", label: "Responsibility", type: "textarea", full: true },
      { name: "bio", label: "Short bio", type: "textarea", full: true },
      sortOrder,
      status("draft"),
    ],
  } satisfies { title: string; description: string; fields: Field[] };
}

function brandList(key: string, listKey: string, label: string, singular: string, withMeta = false): Resource {
  return {
    key,
    table: "content_items",
    label,
    singular,
    group: "Brands",
    hidden: true,
    scope: { list_key: listKey },
    titleField: "title",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "title", label: "Title" },
      { name: "status", label: "Status", format: "status" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: singular,
        fields: [
          brand(),
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Description", type: "textarea", full: true },
          ...(withMeta ? [{ name: "meta", label: "Duration / note", type: "text" } as Field] : []),
          { name: "icon", label: "Icon", type: "select", options: iconOptions },
          sortOrder,
          status(),
        ],
      },
    ],
  };
}

RESOURCES.push(
  brandList("brand-pillars", "brand.pillars", "Brand story pillars", "Pillar"),
  brandList("brand-support", "brand.support", "Investment support", "Support item"),
  brandList("brand-process", "brand.process", "Enquiry-to-opening steps", "Step", true),
  {
    key: "brand-stats",
    table: "stats",
    label: "Brand numbers",
    singular: "Number",
    group: "Brands",
    hidden: true,
    scope: { scope: "brand" },
    titleField: "label",
    list: [
      { name: "brand_id", label: "Brand", format: "relation" },
      { name: "label", label: "Label" },
      { name: "source", label: "Source" },
      { name: "value", label: "Value" },
    ],
    filters: [brandFilter],
    sortable: true,
    orderBy: [{ column: "brand_id" }, { column: "sort_order" }],
    groups: [
      {
        title: "Number",
        description: "Never publish a figure Litensity has not confirmed. Leave the value empty to hide it.",
        fields: [
          brand(),
          { name: "label", label: "Label", type: "text", required: true },
          {
            name: "source",
            label: "Source",
            type: "select",
            required: true,
            defaultValue: "manual",
            options: [
              { value: "manual", label: "Manual value" },
              { value: "stores_live", label: "Auto — stores of this brand (live + opening soon)" },
              { value: "cities", label: "Auto — cities of this brand" },
              { value: "states", label: "Auto — states of this brand" },
            ],
          },
          { name: "value", label: "Value (manual only)", type: "text" },
          { name: "suffix", label: "Suffix", type: "text" },
          sortOrder,
          status(),
        ],
      },
    ],
  },
);

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}

export function canDeleteRecords(resource: Resource): boolean {
  if (resource.singleton) return false;
  return resource.readOnly ? resource.canDelete === true : resource.canDelete !== false;
}

export function allFields(resource: Resource): Field[] {
  return resource.groups.flatMap((g) => g.fields);
}

export const ADMIN_GROUPS = ["Content", "Brands", "Stores", "Investment", "About", "CSR", "Careers", "Media", "SEO", "Settings", "Leads"];
