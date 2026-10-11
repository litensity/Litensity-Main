# Litensity — Architecture & Implementation Plan

Source of truth: `PRD.md` (functional scope) and `CLAUDE.md` (engineering rules).
This file records the decisions taken where those documents leave room, so they can be reviewed.

---

## 1. Repository state at start

Empty apart from `PRD.md` / `CLAUDE.md`. Scaffolded with `create-next-app@16.3.8`
(App Router, TypeScript strict, ESLint flat config, no Tailwind).

| Item | Choice |
| --- | --- |
| Next.js | 16.3 (App Router, Turbopack, `proxy.ts` replaces middleware) |
| React | 19.2 |
| TypeScript | 5.x (TS 7 native compiler deliberately not adopted yet — Next tooling targets 5.x) |
| Styling | CSS Modules + global design tokens (`app/styles/tokens.css`). No Tailwind/UI kit: the brief explicitly rejects the "default Tailwind" look and asks for no extra frameworks. |
| Motion | Native CSS transitions/keyframes + one tiny `IntersectionObserver` hook. No animation library. |
| Validation | `zod` — single schema per form, shared by client and server. |
| Supabase | `@supabase/supabase-js` + `@supabase/ssr` (cookie sessions for admin). |
| Email | `nodemailer`, one transport in `lib/mail/mailer.ts`. |
| Google Sheets | REST API v4 via `fetch`, service-account JWT signed with `node:crypto` (avoids the 80 MB `googleapis` package). |
| Map | Leaflet + OpenStreetMap tiles behind a provider-agnostic `<StoreMap>` interface (provider is an open client decision — swapping to Google Maps touches one adapter file). |

## 2. Caching model

Cache Components is **not** enabled. Public pages use ISR (`revalidate = 300`) and every
Supabase read from the public site is tagged `cms`. Every admin mutation calls
`revalidatePath('/', 'layout')`, so content changes appear immediately and the
5-minute window is only a safety net. Draft preview uses Next `draftMode()`.

## 3. Route map

```
app/
  (site)/                 public site — Header, Footer, sticky Enquire, WhatsApp/call dock
    page.tsx              Home
    brands/page.tsx       Our Brands hub
    brands/[slug]/        ONE brand template for every brand (generateStaticParams from DB)
    invest/               Invest with Us (group)
    stores/               Store Locator (?brand=&state=&city=)
    about/  csr/  careers/  contact/
    privacy/  terms/      legal_documents
  admin/
    login/                Supabase Auth (email + password)
    (panel)/              server-side admin guard in layout + in every action
  api/
    otp/request  otp/verify      gated downloads
    download/[token]             releases private file after verification
    preview/                     draft mode on/off (admin only)
  sitemap.ts  robots.ts  not-found.tsx
proxy.ts                  refreshes Supabase session cookie; optimistic /admin redirect
```

## 4. Supabase schema (see `supabase/migrations/`)

Enums: `publish_status (draft|published|archived)`, `brand_ownership (homegrown|franchise)`,
`store_status (live|opening_soon)`, `media_kind`, `person_kind (founder|leader)`,
`download_kind (menu|brochure)`, `stat_source`, `otp_status`.

| Table | Purpose / key relationships |
| --- | --- |
| `media` | Every uploaded asset (bucket, path, alt, dimensions). Referenced by FK from all content. |
| `site_settings` | Single row: corporate address/contacts, WhatsApp, enquire CTA, analytics ID, default OG image, newsletter toggle. |
| `contact_departments` | Department-wise email/phone for Contact page. |
| `social_links` | `brand_id` nullable → group or brand handles. |
| `navigation_items` | Header / footer-quick / footer-legal menus. |
| `seo_metadata` | Keyed by `route_key` (`home`, `brands`, `brand:<slug>`, …). |
| `pages` / `page_sections` | Copy for every fixed section (eyebrow, heading, body, 2 CTAs, media, enabled flag). Section keys are defined in code (`lib/cms/sections.ts`) so the admin edits content, not structure. |
| `content_items` | Ordered repeatable lists (`list_key` + optional `brand_id`): why-partner pillars, values, capabilities, roadmap, investment support, process steps, careers perks, CSR focus pillars. |
| `stats` | Highlights per scope (`home`, `brand`, `csr`, `invest`). `source` = `manual` or computed from Store Master (`stores_live`, `cities`, `states`, `brands`) so counts never drift from the stores table. |
| `brands` | Identity, colours, typeface preset, copy, and **feature switches** (`feature_menu_download`, `feature_brochure_download`, `feature_investment`, `feature_investment_enquiry`). Investment-form variant (`preferred_location` vs `preferred_format`) is brand config. |
| `product_categories` / `products` | Menu & offering, bestsellers, price label. Doubles as the on-page menu. |
| `campaigns` | Campaigns, launches, programmes (e.g. loyalty). |
| `gallery_items` | `collection` + optional `brand_id` / `csr_initiative_id`. |
| `delivery_links` / `store_order_links` | Brand-level and store-level ordering links. |
| `downloads` | Menu / brochure per brand; file lives in **private** `documents` bucket. |
| `stores` / `store_hours` | Store Master. One row drives map, list, brand pages, filters, counts. |
| `investment_models` | Brand models; figures render only when `figures_confirmed = true`. |
| `faqs` | `scope` + optional `brand_id`. |
| `people` | Founders + leadership (`kind`). |
| `milestones` | About timeline. |
| `csr_initiatives` | Repeatable records; photos via `gallery_items`. |
| `jobs` | Careers; `is_open` + publish status. |
| `legal_documents` | Privacy / Terms. |
| `form_settings` | Per form: sheet ID + tab, notify recipients, ack copy, option lists (budget, timeline…). |
| `lead_submissions` | Delivery log (sheet/email status) for retry & audit. Google Sheets remains the destination. |
| `otp_requests` | Hashed OTP, attempts, cooldown, status; links to sheet row so abandoned = "Unverified". |
| `rate_limits` + `rate_limit_hit()` | Atomic fixed-window limiter (phone, IP, form). |
| `admin_profiles` | `role` (`owner`, `editor`) → `is_admin()` used by RLS. |

RLS: anon can `select` only `published` rows (and live/opening-soon, non-archived stores).
Admins (`is_admin()`) have full access. `form_settings`, `lead_submissions`, `otp_requests`,
`rate_limits` have **no** anon policies — server code uses the service-role key, which is
imported only from `lib/supabase/admin.ts` (`server-only`).

Storage buckets: `media` (public), `documents` (private — menus/brochures, released by signed URL
after OTP), `resumes` (private — linked from the Recruitment sheet through an admin-only signed link).

## 4b. Section builder (added after first review)

Pages are an ordered list of typed sections (`page_sections.kind`, `sort_order`, `tone`, `layout`, `is_enabled`).
`lib/sections/kinds.ts` defines every kind (fields, items, stats, tones, layouts, unique/pinned rules) and is shared by
the public renderer (`components/sections/PageSections.tsx`, `components/sections/brand.tsx`) and the admin builder
(`components/admin/builder/*`). List items and stats belong to their section (`content_items.section_id`,
`stats.section_id`), so duplicating a section duplicates its content. Brand pages share one ordered template
(`page_key = 'brand-template'`) while each brand's feature switches still remove blocks entirely.
Sample content loaded by `scripts/seed-samples.mjs` is tracked in `sample_records` for one-click removal.

## 5. Component architecture

```
components/
  ui/        Button, Container, Section, Heading, Eyebrow, Media, Reveal, ImageReveal,
             Stat, Accordion, Modal, Marquee, CTA
  layout/    Header, MobileMenu, Footer, EnquireDock
  home/      HomeHero, HouseOfBrands, GroupHighlights, FootprintPreview, WhyPartner,
             FoundersPreview, CsrBand, EnquiryBand
  brand/     BrandHero, BrandStory, BrandHighlights, BrandProducts, BrandCampaigns,
             BrandStores, BrandGallery, BrandDownloads, BrandInvestment, BrandEnquiry
  stores/    StoreLocator, StoreMap (adapter), StoreCard, StoreFilters
  forms/     FormField, LeadForm (schema-driven), DownloadGate (OTP flow)
  admin/     AdminShell, DataTable, RecordForm, MediaPicker, StatusBadge, SortableList
```

Brand theming: each brand page sets CSS custom properties (`--brand`, `--brand-ink`,
`--brand-surface`) and a typeface preset; the same components restyle themselves.

## 6. Design system

- **Type**: Fraunces (variable serif, editorial display), Inter Tight (UI/body); brand presets add
  Big Shoulders Display (condensed, loud — BIGGUYS) and Bricolage Grotesque (playful — DCube).
  Fluid `clamp()` scale from 0.8rem to ~11rem display.
- **Colour**: warm paper (`#F3EEE6`), deep roast ink (`#16110D`), ember accent (`#E0461B`);
  brand colours come from the CMS.
- **Layout**: 12-col fluid grid, asymmetric compositions, full-bleed imagery, minimal borders/radii.
- **Motion**: masked line reveals, clip-path image reveals, slow scale on hover, sticky story panels,
  marquee for brand names. All gated by `prefers-reduced-motion`.

## 7. Content safety

Seed data contains **no business facts**. Every unknown value is `[CLIENT CONTENT REQUIRED]`
or `null`. Null stats and unconfirmed investment figures do not render on the public site
(a dev-only notice is shown instead). Missing images render an art-directed placeholder labelled
"Client image required".

## 8. Open client decisions (implemented as configuration)

| Decision | Default implemented | Switch |
| --- | --- | --- |
| OTP channel | `email` (works with existing SMTP) | `OTP_CHANNEL=sms` + provider adapter in `lib/otp/providers/` |
| Map provider | Leaflet + OSM | `components/stores/map/` adapter |
| Menu gating | OTP required | `downloads.requires_otp` per file |
| DCube external site | link hidden | `brands.external_url_enabled` |
| Analytics | GA4 tag when ID set | `site_settings.analytics_id` |

## 9. Phase status

| Phase | Status | Verified by |
| --- | --- | --- |
| 1 Repo + architecture | Done | this document |
| 2 Schema, RLS, storage, auth, CMS | Done | anon REST probes; `scripts/e2e-admin.mjs` |
| 3 Design system + layout | Done | screenshots 390 / 1440 px, no horizontal overflow |
| 4 Homepage | Done | screenshots |
| 5 Brand template × 3 | Done | feature-matrix HTML check (no investment/brochure on Belgian Waffle) |
| 6 Store locator | Done | filters/counts/map at mobile + desktop |
| 7 Invest / About / CSR / Careers / Contact / Legal / 404 | Done | route status sweep |
| 8 Forms → Google Sheets | Done (pipeline) | `scripts/e2e-forms.mjs`; **live Sheets write untested — needs client Google credentials** |
| 9 Nodemailer | Done | Mailpit: alert + acknowledgement + PDF attachment |
| 10 OTP + downloads | Done | start / wrong code / cooldown / verify / signed URL / reuse rejected |
| 11 SEO, sitemap, robots, headers | Done | `/sitemap.xml`, `/robots.txt`, per-page metadata from `seo_metadata` |
| 12 QA | In progress | real-device testing, Lighthouse and client content still to do |

## 10. Known limitations / next steps
- Google Sheets and SMS OTP need client accounts before they can be tested end-to-end.
- Map tiles: OpenStreetMap is development-only; choose a production provider (see `docs/CLIENT_INPUTS.md`).
- Lead retry: failed sheet/email deliveries are visible in Admin → Leads; a one-click "retry" is a candidate enhancement.
- No strict Content-Security-Policy yet (Next inline scripts require nonces); add before launch if required by IT policy.
- `/stores` and `/careers` render per request because they read query parameters; data reads are still cached.
