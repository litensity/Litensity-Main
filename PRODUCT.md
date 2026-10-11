# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Equal weight across audiences (no confirmed ranking); most traffic is expected on phones.

- Customers finding a brand, menu, store or order link.
- Prospective franchisees for BIGGUYS and DCube.
- Group investors (individual, family office, institution, franchise partner).
- Job candidates.
- CSR partners and general enquirers.
- Litensity staff who operate the Admin CMS without developers (owner and editor roles).

## Product Purpose

Corporate website and Admin CMS for Litensity Food and Beverages Pvt Ltd, a multi-brand F&B operating company with three brands: BIGGUYS, Belgian Waffle and DCube Desserts Cafe. The website is a renderer of CMS data; Litensity edits all business content, stores, jobs, CSR initiatives and investment content from Admin. Primary business objective is lead capture and conversion; primary user-facing objective is a premium, memorable experience. Success: all flows work end to end, leads reach the right Google Sheet and inboxes, and the client can add a store, job, CSR initiative or fourth brand without a developer.

## Positioning

A house of brands: one operator running homegrown and franchise F&B brands, with group-level operating capability (rollout, supply chain, marketing, people). Specific claims must come from Litensity content in the CMS. Working ownership labels (to be confirmed): DCube is homegrown; BIGGUYS and Belgian Waffle are franchise brands operated by Litensity.

## Operating Context

- Public site: Home, Our Brands hub, one shared brand template (BIGGUYS, Belgian Waffle, DCube), Invest with Us, Store Locator, About & Founders, CSR, Careers (with role detail pages), Contact, Privacy, Terms, 404, sitemap and robots.
- Brands share one reusable brand page template driven by configuration and per-brand feature switches (menu download, investment block, brochure, investment enquiry); brand colours and typeface preset re-theme the same components.
- Single Store Master in Supabase drives the map, store lists, brand pages, filters and counts. Live stores are pinned; Opening Soon stores are listed without a pin; archived stores are hidden everywhere.
- Six capture points: BIGGUYS investment, DCube investment, gated download, Litensity investor, hiring, general + CSR enquiry. Each writes to its own Google Sheet with automatic brand, source page and source section tags, sends an internal alert and a visitor acknowledgement, and is logged in Admin → Leads with its delivery status. Leads can also be exported to Excel.
- Two gated download flows behind OTP: menus (all brands) and brochures (BIGGUYS and DCube only). The menu is also browsable on page. OTP gating is a per-file switch.
- Sticky Enquire button, mobile WhatsApp/call dock and footer on every page; Privacy and Terms reachable from every form.
- Admin: dashboard (counts, recent leads, "Content still required" list, one-click sample removal), page builder with live desktop/tablet/mobile preview, brands, stores, media library, founders/leadership/milestones, jobs, CSR initiatives and photos, investment models and FAQs, leads, Excel export, settings (company and contact, forms and lead routing, menus, social, departments, SEO, legal) and admin users.
- Draft → preview → publish on records; saves revalidate the site immediately.
- Outbound email (acknowledgements, OTP, files) is sent from hello@litensity.com.

## Capabilities and Constraints

- Stack is fixed: Next.js 16, TypeScript, Supabase (Postgres, Auth, Storage), Google Sheets for leads, Nodemailer. No separate backend, no other database, no CRM, no Tailwind or UI kit, no animation library.
- Belgian Waffle has no investment section, brochure or brand investment enquiry; when a feature is off its component does not render at all (no empty or disabled block).
- Admin edits content and supported configuration through designed section types: editors can add, reorder, duplicate, hide and delete sections and pick tone/layout variants, but cannot change the design system, write CSS/JS or build free-form layouts. Heroes stay pinned; data-driven blocks appear at most once per page.
- Map is Leaflet + OpenStreetMap behind a provider adapter (OSM tiles are development-only); OTP channel defaults to email behind a provider adapter. Both stay switchable until the client decides.
- Undecided with client: OTP channel (email vs SMS), production map provider, whether the menu gate stays mandatory, whether dcubedessertscafe.com is linked, animation intensity, analytics account, alert recipients per form, domain and hosting.
- Resumes and gated files live in private storage only, released by short-lived signed URLs (admin-only for resumes, post-OTP for menus and brochures).
- No self-service password reset for admins yet; owners or the developer reset passwords.

## Brand Commitments

- Brand names: Litensity, BIGGUYS, Belgian Waffle, DCube Desserts Cafe. Logos (standard and reverse) and colours are CMS-configurable per brand; current palettes are taken from each brand's own logo and website (BIGGUYS red #C3002D, Belgian Waffle yellow #FFC10E, DCube deep teal #013240) pending formal brand guidelines.
- Client brand identity, assets and content take precedence over any visual inspiration.
- Visual quality bar is Awwwards.com as inspiration only; no copying of layouts, code, text, assets or animations. Generic SaaS, ThemeForest, Bootstrap, Dribbble/Behance or competitor sites are not references.
- Premium, editorial, bold, F&B appropriate, conversion-oriented. Group design system: warm paper, deep roast ink, ember accent; Fraunces display serif with Inter Tight; brand presets add Big Shoulders Display (BIGGUYS) and Bricolage Grotesque (DCube). Avoid generic corporate blocks, repetitive 3-column card grids, excessive rounded cards, random gradients, glassmorphism, default Tailwind look.
- Motion is welcome but purposeful (masked reveals, image reveals, sticky story panels, marquee, optional 3D brand objects); `prefers-reduced-motion` must be honored and mobile performance protected.

## Evidence on Hand

- PRD.md, CLAUDE.md, README.md (client admin guide), docs/DEVELOPMENT.md, docs/ARCHITECTURE.md, docs/CLIENT_INPUTS.md (what Litensity must still supply) and docs/QA_CHECKLIST.md (manual test plan and latest audit).
- Real client assets loaded in staging: brand logos and reverse logos, brand palettes, the real store list, BIGGUYS studio photography and a 63-item BIGGUYS menu (names only), and DCube hero, card and gallery images rendered from RAW previews.
- Still missing from the client: edited DCube photographs, any Belgian Waffle photography, BIGGUYS veg marks, bestsellers, descriptions and prices, menu PDFs and brochures, investment content, company story, founders, CSR, jobs and legal text.
- The hosted database is staging: it holds removable sample content (illustrative photos, copy and figures) that must be cleared with Dashboard → Remove sample content before launch. DEV SAMPLE fixtures are local-only and must never ship.
- Not yet tested end to end: live Google Sheets writes and production SMTP (waiting on client credentials), SMS OTP, real-device and Lighthouse passes. Public sign-ups and the default social-share image still need setting on the hosted project.
- Not available and must never be invented: investment amounts, ranges, ROI/payback, store counts, city/state counts, team size, commercial terms, support claims, corporate facts. Missing values carry `[CLIENT CONTENT REQUIRED]`, which shows as a marker in development and is hidden in production; investment figures and ticket sizes render only when marked confirmed in writing.

## Product Principles

1. The site renders CMS data; components own layout, behavior and motion, Supabase owns content.
2. Never publish an unconfirmed commercial or corporate figure.
3. One reusable template per concept (brand page, store, initiative, job); no per-brand copies.
4. Conversion paths (enquire, find a store, download a menu, apply) are reachable within two clicks on every page, one-handed on a phone.
5. No lead is lost: every submission is logged before delivery to Sheets and email.
6. Original Litensity experience, not a clone of any reference.

## Accessibility & Inclusion

Mobile-first, no horizontal scroll, large tap targets (44 px minimum), semantic HTML with one h1 and no skipped heading levels, visible focus, labelled forms with clear errors, accessible dialogs and accordions, sufficient contrast, reduced-motion support, alt text on all imagery.
