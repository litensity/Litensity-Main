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
- Litensity staff who operate the Admin CMS without developers.

## Product Purpose

Corporate website and Admin CMS for Litensity Food and Beverages Pvt Ltd, a multi-brand F&B operating company with three brands: BIGGUYS, Belgian Waffle and DCube Desserts Cafe. The website is a renderer of CMS data; Litensity edits all business content, stores, jobs, CSR initiatives and investment content from Admin. Primary business objective is lead capture and conversion; primary user-facing objective is a premium, memorable experience. Success: all flows work end to end, leads reach the right Google Sheet and inboxes, and the client can add a store, job, CSR initiative or fourth brand without a developer.

## Positioning

A house of brands: one operator running homegrown and franchise F&B brands, with group-level operating capability (rollout, supply chain, marketing, people). Specific claims must come from Litensity content in the CMS.

## Operating Context

- Three brands share one reusable brand page template driven by configuration and feature switches.
- Single Store Master in Supabase drives the map, store lists, brand pages, filters and counts.
- Six capture points: BIGGUYS investment, DCube investment, gated download, Litensity investor, hiring, general + CSR enquiry. Each writes to its own Google Sheet and sends internal and acknowledgement email.
- Two gated download flows behind OTP: menus (all brands) and brochures (BIGGUYS and DCube only). Menu is also viewable on page.
- Sticky Enquire button and footer on every page; Privacy and Terms reachable from every form.

## Capabilities and Constraints

- Stack is fixed: Next.js, TypeScript, Supabase (Postgres, Auth, Storage), Google Sheets for leads, Nodemailer. No separate backend, no other database, no CRM.
- Belgian Waffle has no investment section, brochure or brand investment enquiry; when a feature is off its component does not render at all (no empty or disabled block).
- Admin edits content and supported configuration only; it is not a free-form page builder.
- Map provider and OTP channel/provider are undecided and must stay abstracted/switchable.
- Undecided with client: menu gate mandatory or optional, whether dcubedessertscafe.com stays live, animation intensity, analytics platform.
- Resumes and sensitive lead attachments live in private storage only.

## Brand Commitments

- Brand names: Litensity, BIGGUYS, Belgian Waffle, DCube Desserts Cafe. Brand logos and colours are supplied by the client and are CMS-configurable per brand.
- Client brand identity, assets and content take precedence over any visual inspiration.
- Visual quality bar is Awwwards.com as inspiration only; no copying of layouts, code, text, assets or animations. Generic SaaS, ThemeForest, Bootstrap, Dribbble/Behance or competitor sites are not references.
- Premium, editorial, bold, F&B appropriate, conversion-oriented. Avoid generic corporate blocks, repetitive 3-column card grids, excessive rounded cards, random gradients, glassmorphism, default Tailwind look.
- Motion is welcome but purposeful; `prefers-reduced-motion` must be honored and mobile performance protected.

## Evidence on Hand

- PRD.md and CLAUDE.md in the repo; docs/CLIENT_INPUTS.md lists what Litensity still must supply.
- DEV SAMPLE stores, placeholder founders and sample pictures exist only for development and must not ship.
- Not available and must never be invented: investment amounts, ranges, ROI/payback, store counts, city/state counts, team size, commercial terms, support claims, corporate facts. Missing values show a clear CMS placeholder or `TODO: CLIENT INPUT REQUIRED`.

## Product Principles

1. The site renders CMS data; components own layout, behavior and motion, Supabase owns content.
2. Never publish an unconfirmed commercial or corporate figure.
3. One reusable template per concept (brand page, store, initiative, job); no per-brand copies.
4. Conversion paths (enquire, find a store, download a menu, apply) are reachable within two clicks on every page, one-handed on a phone.
5. Original Litensity experience, not a clone of any reference.

## Accessibility & Inclusion

Mobile-first, no horizontal scroll, large tap targets, semantic HTML, visible focus, labelled forms with clear errors, accessible dialogs and accordions, sufficient contrast, reduced-motion support, alt text on all imagery.
