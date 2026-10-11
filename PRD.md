# PRODUCT REQUIREMENTS DOCUMENT
**Litensity Food and Beverages Pvt Ltd — Corporate Website + Admin CMS**
Developer PRD • Next.js + Supabase • Google Sheets Leads • Nodemailer
Design direction: premium, highly polished, Awwwards-inspired digital experience
Source basis: Litensity Food and Beverages Pvt Ltd Build Brief. This PRD converts the client brief into an implementation-ready product specification while adding the agreed architecture requirement that website content and business data are managed from an Admin Panel.
## 1. Product Overview
Build a premium corporate website for Litensity Food and Beverages Pvt Ltd covering its three brands: BIGGUYS, Belgian Waffle and DCube Desserts Cafe. The primary business objective is lead capture and conversion, while the primary user-facing objective is a highly attractive, modern and memorable website experience.
- Three reusable brand pages driven by configuration rather than separate hard-coded templates.
- Eight top-level areas: Home, Our Brands, Invest with Us, Store Locator, About and Founders, CSR, Careers and Contact, plus Privacy Policy and Terms.
- Six lead/capture points: BIGGUYS investment, DCube investment, group investor, hiring, general/CSR enquiry and gated downloads.
- Two gated download flows: menus for all brands; franchise/investment brochures for BIGGUYS and DCube.
- Every form writes to its designated Google Sheet and triggers email notifications/acknowledgements.
- Store data has one source of truth in Supabase and drives the map, brand pages and store lists.
- Mobile-first experience; most traffic is expected to be from phones.
- No commercial figure may be published without written Litensity confirmation.
## 2. Product Goals
- Create a premium F&B corporate presence that immediately communicates credibility, scale and brand quality.
- Make the visual experience the strongest part of the product: typography, imagery, composition, motion and transitions must feel intentional.
- Convert visitors into customers, investors, franchise leads, candidates and CSR partners.
- Allow Litensity to manage all business/content data from the Admin Panel without developer intervention.
- Make adding a fourth brand, new stores, new jobs, new CSR initiatives and new content a content operation rather than a development task.
- Keep the implementation maintainable and reusable through a single Next.js application and a normalized Supabase data model.
## 3. Scope
### 3.1 Public Website
- Home
- Our Brands hub
- BIGGUYS
- Belgian Waffle
- DCube Desserts Cafe
- Invest with Us
- Store Locator
- About and Founders
- CSR
- Careers
- Contact
- Privacy Policy
- Terms
### 3.2 Admin Panel / CMS
The Admin Panel is a first-class part of the product. All business/content-related website data must be editable from the Admin Panel. The underlying component architecture, responsive behavior, animation logic and technical functionality remain controlled by the application.
- All page headings, subheadings, paragraphs, labels, CTAs, links and configurable text.
- Images, videos, logos, founder photos, product/store photography and galleries.
- Brands and brand-specific feature switches.
- Store Master rows and store availability/status.
- Menus and brochures/files.
- Investment models, ranges, area requirements, support, process and FAQs.
- Founder and leadership profiles.
- CSR focus areas, initiatives, impact figures and gallery items.
- Careers and open roles.
- Global header/footer/contact/social information.
- SEO titles, meta descriptions, social preview data and image alt text.
- Form configuration where appropriate, including nominated notification recipients and destination-sheet mapping.
- Publish/unpublish controls and content visibility.
## 4. Technology Architecture

| Layer | Technology / Decision |
| --- | --- |
| Frontend | Next.js + TypeScript |
| Backend/API | Next.js Server Actions / Route Handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Admin Panel | Next.js within the same application |
| Lead destination | Google Sheets; separate sheets by enquiry type |
| Email | Nodemailer from Next.js server-side runtime |
| OTP | Channel must be configurable; SMS/email provider to be confirmed by Litensity |
| Maps | Map provider to be confirmed; Google Maps preferred if API/account is available |
| Deployment | Next.js-compatible deployment; final provider to be confirmed |
| Design | Awwwards.com-inspired only; no direct copying |

No separate Express/Node backend is required. Server-side functionality should live inside the Next.js application. Supabase is the system of record for website content, store data, admin data and application data; Google Sheets remains the lead destination for the current phase.
## 5. Information Architecture and Navigation
Every visitor should be at most two clicks from the page that serves them.
- Homepage → Our Brands → individual brand pages.
- Homepage/Header → Invest with Us.
- Homepage/Header → Store Locator.
- Homepage/Header/Footer → About and Founders.
- Homepage/Header/Footer → CSR.
- Homepage/Header/Footer → Careers.
- Homepage/Header/Footer → Contact.
- Sticky Enquire button appears on every page.
- Footer appears on every page.
## 6. Homepage Requirements

| Order | Section | Requirements |
| --- | --- | --- |
| 1 | Hero | Litensity positioning line, group visual, primary CTAs: Explore Brands and Invest with Us. |
| 2 | House of Brands | Three brand tiles; homegrown/franchise label; link to brand page. |
| 3 | Group Highlights | Brands operated, stores live, cities, states, team size; all editable in Admin. |
| 4 | Footprint Preview | Compact India map linking to Store Locator. |
| 5 | Why Partner | Multi-brand operating experience, supply chain, marketing, rollout. |
| 6 | Founders Preview | Founder photos and names linking to About and Founders. |
| 7 | CSR Preview | Image-led band linking to CSR. |
| 8 | Enquiry + Footer | Investor, careers and contact CTAs; brand social links; address; legal links. |

## 7. Our Brands
### 7.1 Hub
- Intro explaining how Litensity builds and operates brands.
- Three brand cards with logo, one-line positioning and store count.
- Homegrown vs franchise label on every card.
- Quick links: view menu, find a store, enquire to invest.
- Comparison strip: format, ticket size range and cities present.
- Closing CTA into Litensity investor enquiry.
### 7.2 Shared Brand Template

| Block | Behavior |
| --- | --- |
| Brand Hero | Logo, tagline, hero imagery and brand colour treatment. |
| Brand Story | Origin, category and differentiation. |
| Highlights | Stores, cities, orders, years. |
| Menu & Offering | Category showcase, bestsellers and price positioning. |
| Store Details | Address, timings, contact and order links. |
| Store Locator | Map pre-filtered to the current brand. |
| Gallery | Store interiors, product shots and campaign visuals. |
| Downloads | Menu for all; brochure for BIGGUYS and DCube. |
| Investment | BIGGUYS and DCube only; hidden entirely for Belgian Waffle. |
| Brand Enquiry | Brand-routed form with source captured automatically. |

Adding a fourth brand must be a content/configuration task, not a development task.
### 7.3 Brand Feature Matrix

| Feature | BIGGUYS | Belgian Waffle | DCube |
| --- | --- | --- | --- |
| Dedicated brand page | Yes | Yes | Yes |
| Brand story/gallery/highlights | Yes | Yes | Yes |
| Store details | Yes | Yes | Yes |
| Store locator pins | Yes | Yes | Yes |
| Order/delivery links | Yes | Yes | Yes |
| Menu download + OTP | Yes | Yes | Yes |
| Brochure download | Yes | No | Yes |
| Investment/franchise section | Yes | No | Yes |
| Brand investment enquiry | Yes | No | Yes |

### 7.4 BIGGUYS
- Korean-Indian fusion fried chicken positioning.
- Signature range and flavour story.
- Highlights: stores, cities, orders.
- Store list, timings and contacts.
- BIGGUYS-filtered locator.
- Store/product gallery.
- Delivery and aggregator links.
- Campaign and new-launch highlights.
- Menu PDF and franchise/investment brochure behind OTP.
- Investment models/formats, indicative range, area/site requirement and Litensity support.
- Investment form: name, phone, email, city, preferred location, budget range, timeline, message.
- Lead tagged BIGGUYS at source and auto-acknowledgement sent.
### 7.5 DCube Desserts Cafe
- Craft-your-own dessert positioning and tagline.
- Product range: waffles, donuts, croissants, ice cream and beverages.
- Eggless and customisation story.
- Store formats: high street, mall kiosk and cloud kitchen.
- Highlights, store list and locator.
- Gallery and campaign visuals.
- Cubicles loyalty and content IP.
- Delivery and aggregator links.
- Menu and franchise/investment brochure behind OTP.
- Investment models side-by-side, format-wise range, onboarding/launch, training and marketing support.
- Investment form: name, phone, email, city, preferred format, budget range, timeline, message.
- Optional link to dcubedessertscafe.com, subject to Litensity confirmation.
### 7.6 Belgian Waffle
- Brand introduction/category positioning.
- Product showcase.
- Highlights: stores and cities.
- Store list with address, timings and contact.
- Brand-filtered store locator.
- Menu download with OTP.
- Order/delivery links.
- General customer enquiry.
- NO investment/franchise section.
- NO franchise brochure.
- NO brand-level investment enquiry form.
- Investment and brochure blocks must be hidden, not rendered empty.
## 8. Store Locator
- One group-wide locator available site-wide and pre-filtered on each brand page.
- Interactive India map with one pin per operating store.
- Brand-coloured pins.
- Zoom to state, city and locality.
- Filter by brand, state and city.
- Search by pincode or locality.
- Use current location for nearest-store behavior when permission is granted.
- Store card: name, full address, opening hours, phone, directions, order links and optional photograph.
- Mobile list view alongside/below map, city-wise.
- Nearest-first sorting when location is allowed.
- Result count for each filter.
- Single source of truth: one store row update must update map, brand pages and store list.
### 8.1 Store Master — Supabase

| Field | Required | Purpose |
| --- | --- | --- |
| Brand | Yes | BIGGUYS / Belgian Waffle / DCube |
| Store name | Yes | Customer-facing name |
| Full address | Yes | Store card |
| City and state | Yes | Filters |
| Pincode | Yes | Search |
| Latitude / longitude | Yes | Map placement |
| Opening hours | Yes | Per day or uniform range |
| Contact number | Yes | Click-to-call |
| Order online links | Optional | Delivery partners |
| Store photograph | Optional | Store card |
| Status | Yes | Live / Opening Soon; controls map visibility |

The field list must be confirmed with Litensity before build.
## 9. Gated Downloads + OTP
- Every download is treated as a captured lead.
- Menu available on all three brands.
- Franchise/investment brochure available only on BIGGUYS and DCube.
- Step 1: click download.
- Step 2: collect name, email and mobile number plus consent checkbox.
- Step 3: send OTP; resend after cooldown.
- Step 4: release/open/download file after successful verification.
- Step 5: write lead to Downloads sheet with brand, file type, date and source page.
- Step 6: send auto-email with file attached and internal alert.
- Rate-limit OTP by phone number and IP.
- Log abandoned OTP attempts as unverified.
- OTP delivery method must be configurable between SMS/email based on Litensity decision.
- Menu should also be viewable on-page so abandoning OTP does not dead-end the customer journey.
## 10. Investment
### 10.1 Brand Investment
- BIGGUYS and DCube only.
- Opportunity/value proposition.
- Models offered and what each includes.
- Indicative investment range and area requirement.
- Payback/return expectations as ranges with assumptions.
- Support: site selection, fit-out, training, supply chain, marketing and operations.
- Six-step process from enquiry to store opening with indicative durations.
- 8–10 FAQs covering eligibility, timelines, agreements and exclusivity.
- Brand-tagged enquiry form with budget and timeline fields and brochure download.
- No investment, return or payback figure goes live without written Litensity confirmation.
### 10.2 Group Invest with Us
- Litensity as a multi-brand F&B operating company.
- Homegrown and franchise brand model.
- Operating capability: rollout, supply chain, marketing and people.
- Portfolio snapshot with Litensity-supplied figures.
- Published growth roadmap.
- Governance and leadership credibility.
- Conversation/CTA framing.
- Fields: name, organisation, email, phone, city, interest area, investor type, indicative ticket size, timeline, message.
- Interest area: group / BIGGUYS / DCube / not sure yet.
- Investor type: individual / family office / institution / franchise partner.
- Dedicated Investor Google Sheet, instant nominated-recipient email and auto-acknowledgement.
## 11. About and Founders
- Company story: how Litensity started and why.
- House-of-brands thinking.
- Milestone timeline: incorporation, first store, brand launches, expansion.
- Founder profiles: photo, name, designation, professional background, responsibility, LinkedIn where available.
- Vision statement.
- 3–4 operating values.
- Medium-term intent.
- Optional leadership-beyond-founders block with function heads, photos and roles.
- Leadership entries must be addable later without redesign.
- Founder photos use a consistent crop ratio and background treatment.
## 12. Careers
- Why work with Litensity.
- Life at Litensity with images.
- Open roles: title, brand, location and type.
- Expandable role description.
- General application for candidates with no matching role.
- Application fields: full name, email, phone, role, brand, preferred city/location, years of experience, current employer, resume upload/link, short message.
- Each submission writes to Recruitment Google Sheet.
- Automatically capture timestamp, role and source page.
- Resume stored and linked from the sheet row.
- Email alert to HR and auto-acknowledgement to candidate.
- Leave trailing sheet columns free for HR status tracking.
## 13. CSR
- Image-led CSR page.
- Opening statement in 2–3 sentences with hero image.
- 3–4 focus pillars with icon and short description.
- Repeatable initiative cards: title, location, date, description, 2–3 photographs.
- Impact highlights with Litensity-supplied figures.
- Photo grid across initiatives with expandable lightbox.
- Partner-with-us enquiry form routed to its own/general enquiry sheet.
- New initiatives are content records, never new templates.
## 14. Global Site Elements
- Header: Litensity logo linking home; Brands, Invest, Store Locator, About, CSR, Careers, Contact.
- Sticky Enquire button on every page.
- Mobile menu.
- Footer: corporate address/contact; brand links/social handles; quick menu/brochure links; privacy/terms; newsletter/updates signup.
- Contact page: corporate address/map; department-wise email/phone; general enquiry; franchise/careers/media routing.
- Responsive mobile/tablet/desktop.
- On-page SEO: titles, descriptions, heading hierarchy.
- WhatsApp and click-to-call on mobile.
- Favicon and social share previews.
- 404 page and XML sitemap.
## 15. Lead Capture and Google Sheets

| Form | Visitor Fields | Auto-Captured | Sheet |
| --- | --- | --- | --- |
| BIGGUYS Investment | Name, phone, email, city, preferred location, budget, timeline, message | Brand, source page, timestamp | Franchise Leads |
| DCube Investment | Name, phone, email, city, preferred format, budget, timeline, message | Brand, source page, timestamp | Franchise Leads |
| Gated Download | Name, email, phone, consent | Brand, file type, OTP status, timestamp | Downloads |
| Litensity Investor | Name, organisation, email, phone, city, interest area, investor type, ticket size, timeline, message | Source page, timestamp | Investor |
| Hiring | Name, email, phone, role, brand, city, experience, employer, resume, message | Role, source page, timestamp | Recruitment |
| General + CSR | Name, email, phone, enquiry type, message | Enquiry type, source page, timestamp | General Enquiry |

- Validate phone and email on every form.
- Clearly mark required fields.
- Keep visible field count low.
- Anti-spam on every public form.
- Every submission writes to its designated sheet, not a combined inbox.
- Every submission triggers internal email alert and auto-acknowledgement.
- Brand/source tagging must be automatic.
## 16. Admin Panel — Detailed Requirements
### 16.1 Admin Dashboard
- Secure admin login using Supabase Auth.
- Dashboard summary of content areas and operational records.
- Quick access to Brands, Pages, Stores, Careers, CSR, Investment, Media and Settings.
- Basic publish/status indicators.
- Admin role model should be extensible even if the first release has one administrator.
### 16.2 Page / Content CMS
- Edit every business/content text field used by the public website.
- Edit CTA labels and destinations.
- Edit section images/video/media.
- Edit stats/highlights.
- Edit SEO title, meta description, social preview image and alt text.
- Enable/disable configurable sections where the page template supports conditional blocks.
- Draft/publish state is recommended for client safety.
- Content must be stored in Supabase and rendered dynamically by Next.js.
### 16.3 Brand CMS
- Create/edit brand.
- Brand name, slug, type, logo, colours, tagline, hero media.
- Story, category, highlights, products/bestsellers.
- Gallery and campaigns.
- Menu and brochure files.
- Order/delivery links.
- Investment configuration.
- Brand enquiry configuration.
- Feature switches for downloads/investment blocks.
- Ability to add a fourth brand without code changes.
### 16.4 Store CMS
- Create/edit/archive stores.
- All Store Master fields managed from Admin.
- Live/Opening Soon status.
- Assign store to brand.
- Upload/change store photograph.
- Manage delivery/order links.
- Changes immediately drive public map, brand pages and lists.
### 16.5 Careers CMS
- Create/edit/publish/archive jobs.
- Manage title, brand, location, type, description and requirements.
- Toggle open/closed status.
### 16.6 CSR CMS
- Manage opening statement, focus areas, initiatives, impact figures, gallery and partner enquiry configuration.
- Add unlimited repeatable initiatives without new code.
### 16.7 Investment CMS
- Manage models, ranges, area requirements, support, process, FAQs, assumptions and CTAs.
- No unconfirmed commercial figures should be published.
### 16.8 Media / File CMS
- Supabase Storage-backed media library.
- Upload/replace images, PDFs and approved files.
- Reuse media records across pages.
- Menu and brochure files must be managed without code changes.
- Resume files are treated separately from public media and must not be publicly exposed.
### 16.9 Global Settings
- Corporate address/contact.
- Department contacts.
- Social handles.
- WhatsApp number.
- Header/footer links and CTA labels.
- Favicon/social preview defaults.
- Analytics configuration.
- Legal page links.
- Newsletter/updates configuration if enabled.
## 17. Visual Design and Motion Direction
The client priority is an attractive, premium website. The implementation must not look like a generic CMS-driven corporate template. The design language must be inspired only by the quality bar and patterns observed on Awwwards.com.
- Use strong art direction, typography, whitespace, image composition and intentional layouts.
- Use smooth scroll-based reveals, image transitions, hover interactions, subtle parallax and section transitions where they improve storytelling.
- Animation must be premium and purposeful, not decorative noise.
- Avoid excessive animation that hurts readability, accessibility or performance.
- Respect prefers-reduced-motion.
- Mobile motion must be adapted for touch and performance.
- Do not copy a specific Awwwards site, layout, code, text, assets or branding. Use Awwwards only as inspiration/reference for interaction and visual quality.
- Client brand identity, provided assets and content always take precedence over inspiration.
## 18. Responsive, Performance, Accessibility and SEO
- Mobile-first; no horizontal scroll at any width.
- Test mobile, tablet and desktop.
- Touch targets and forms usable one-handed.
- Compressed images and lazy loading below the fold.
- Optimize LCP/CLS/INP and avoid animation-induced layout shifts.
- Semantic heading hierarchy.
- Accessible labels and focus states.
- Keyboard accessibility for interactive controls where applicable.
- Respect reduced motion.
- Page titles, meta descriptions and heading hierarchy.
- Favicon and social share previews.
- XML sitemap and 404 page.
- Analytics installed before launch.
## 19. Security and Data Handling
- Supabase Row Level Security must be used for protected database access.
- Admin routes must require authenticated admin access.
- Server-side secrets must never be exposed to the browser.
- Google Sheets credentials/tokens and email credentials must remain server-side.
- Public forms require validation and anti-spam.
- OTP requests require phone/IP rate limiting and resend cooldown.
- Resume files must use controlled/private storage and signed/authorized access.
- Do not expose service-role credentials.
- Sanitize/validate uploaded files and user input.
- Privacy Policy and Terms must be reachable from every form.
## 20. Client Inputs Required
- GitHub repository/organization ownership and access.
- Brand logos in vector/high resolution.
- Brand colours and fonts where defined.
- Product and store photography per brand.
- Approved menu PDFs for all brands.
- BIGGUYS and DCube franchise/investment brochures.
- Investment models, ranges, area requirements, support and onboarding process.
- Written confirmation for every published commercial figure.
- Company story and vision.
- Founder photographs, designations and bios.
- Milestone timeline.
- Corporate address and department contacts.
- Store Master: brand, name, address, city, timings, phone and coordinates.
- Order-online links per store.
- CSR initiative content and photographs.
- Open roles and job descriptions.
- Google account/access for required Google Sheets integration.
- Nominated recipients for internal email alerts.
- OTP channel/provider decision.
- Map provider/API decision.
- Confirmation whether dcubedessertscafe.com remains live.
- Confirmation whether menu gating remains mandatory.
## 21. Open Decisions / Client Confirmation
- OTP: SMS or email? If SMS, which provider/account? If email, confirm sender mailbox/domain and delivery expectations.
- Map: Google Maps API/account available, or another provider?
- Menu gate: mandatory OTP or optional?
- DCube external website: keep dcubedessertscafe.com live and link out, or duplicate content?
- Animation intensity: minimal, moderate or highly animated.
- Reference websites: Awwwards.com only for design inspiration; identify any specific quality/style preferences if desired.
- Lead data: current phase uses separate Google Sheets as specified.
- Admin users/roles: who will manage the CMS?
- Domain/hosting ownership and deployment access.
- Email recipients for each enquiry type.
- Analytics platform/account.
## 22. Acceptance / QA Checklist
- Every brand page renders correct blocks on/off.
- Belgian Waffle has no investment block and no brochure link anywhere.
- Menu download works on all three brands.
- Brochure download works on BIGGUYS and DCube only.
- OTP sends, verifies, resends after cooldown and fails gracefully.
- Abandoned OTP attempts are logged as unverified.
- Every store pin opens a card with address, hours, phone and directions.
- Store filters return correct counts for brand, city and state.
- All six forms submit, write a sheet row and fire both emails.
- Source page and brand tags are correct on every submission.
- Resume upload stores and links correctly from the sheet row.
- Every page tested on a real phone.
- No placeholder text, dummy images or unconfirmed figures remain.
- Privacy Policy and Terms are reachable from every form.
- Admin can update content without developer intervention.
- Adding a store updates all required public surfaces.
- Adding a CSR initiative does not require a new page/template.
- Adding a brand is possible through the CMS/configuration model without a code change.
## 23. Scope Guardrails
- This product is not a free-form page builder. Admin controls all business/content data and supported configuration; it does not arbitrarily redesign the component system.
- Google Sheets is the current lead destination; a CRM is not included unless separately approved.
- A separate backend service is not part of the architecture; server functionality belongs in Next.js.
- The Admin Panel does not need to expose internal application architecture, code, database schema or arbitrary CSS/JS editing.
- Commercial numbers must never be invented by the development team.
- No direct copying of Awwwards websites, assets or code.
## 24. Definition of Done
The product is considered ready for handover when the public website is visually polished and responsive, all required flows work end-to-end, all lead submissions reach the correct Google Sheet and email recipients, OTP/download behavior works, the Store Master is the single source of truth, the Admin Panel can manage all specified content/data without developer intervention, no unconfirmed figures or placeholders remain, and the QA checklist has been completed.
Primary source: Litensity Food and Beverages Pvt Ltd — Corporate Website Build Brief (28 pages).
Implementation decisions added for this project: Next.js + Supabase for the application; Google Sheets for lead destinations; Nodemailer for email delivery; Awwwards.com as the sole design-inspiration reference.
