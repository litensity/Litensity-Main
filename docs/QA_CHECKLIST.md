  # Litensity — Manual QA Checklist

How to check every requirement in `PRD.md` and `CLAUDE.md` by clicking through the site and admin.
Tick each box as you go. If something fails, note the URL, the screen width and what you saw.

Notation: **Site →** a public page · **Admin →** a screen in `/admin` · **Check:** what you should see.

---

## Current status (last audit: 9 Oct 2026)

The site now runs against the **hosted** Supabase project `gjlstiedcieiweyschcj` (region: Tokyo). These were checked automatically against the running site; re-run them after big changes.

| Check | Result |
| --- | --- |
| `npm run typecheck` | ✅ Pass |
| `npm run lint` | ✅ 0 errors, 0 warnings (vendored `.agents/` tooling is now excluded) |
| `npm run build` | ✅ Pass. Build workers are capped at 2 in `next.config.ts`; with the default worker count the build ran out of memory on a dev machine running Docker. |
| All 13 public pages at 390 px and 1440 px | ✅ HTTP 200, one `<h1>`, no skipped heading levels, no horizontal scroll, no console errors, no images without `alt`, unique titles, description + canonical present |
| Privacy + Terms on every form | ✅ All forms, including the footer newsletter (fixed in this audit) |
| Belgian Waffle exclusion | ✅ No brochure, investment block or brand investment form in the HTML; not offered in the `/invest` interest dropdown |
| Sitemap / robots | ✅ All 13 pages, no `/admin`; robots blocks `/admin` and `/api` |
| Secrets in browser code | ✅ The real secret key appears in 0 of 59 browser files; no SMTP, Google or `APP_SECRET` values |
| Row Level Security | ✅ Enabled on every table. Anonymous users can't read leads, OTP records, form settings, admin profiles, résumés or private documents. |
| Storage buckets | ✅ `media` public; `documents` and `resumes` private |
| Store tap targets | ✅ Store names in the locator list now have a ≥ 44 px tap area (fixed in this audit) |
| **Public sign-ups disabled** | ❌ **Still on** in the hosted project (see §15) |
| **Default social-share image** | ❌ Not set, so `/brands`, `/invest`, `/stores`, `/contact`, `/privacy` and `/terms` have no `og:image` (see §16) |
| **Email (SMTP)** | ⏳ Not configured yet. Waiting on the client (see §1). |
| **Google Sheets** | ⏳ Not configured yet (see §1) |

---

## 0. Setup

### Environment you're testing

`.env.local` decides which database you're testing against:

| | Hosted (current) | Local (Docker) |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gjlstiedcieiweyschcj.supabase.co` | `http://127.0.0.1:54321` |
| Database UI | Supabase dashboard → Table editor | Supabase Studio, http://127.0.0.1:54323 |
| Emails | Go nowhere until SMTP is set up (§1) | Caught by Mailpit, http://127.0.0.1:54324 |

**What's in the hosted database right now:** the schema (all 5 migrations), `seed.sql`, the removable sample photos and content (`npm run samples:load`), and, copied from the local database, the 12 **DEV SAMPLE / QA** stores (with hours and order links), 1 DEV SAMPLE job and 3 placeholder milestones. **It's a staging database, not production.** See §20 before launch.

### Hosted setup (already done; repeat for a new project)

- [x] `npm install`
- [x] `.env.local` uses **this app's variable names**. The Supabase dashboard uses newer names, so map them like this:

  | Supabase dashboard calls it | Put it in `.env.local` as |
  | --- | --- |
  | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
  | Publishable key (`sb_publishable_…`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
  | Secret key (`sb_secret_…`) | `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`) |

  Also set `APP_SECRET` (32+ random characters). `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL` aren't used by this app and can be deleted.
- [x] `npx supabase link --project-ref gjlstiedcieiweyschcj`, then `npx supabase db push` (schema, RLS, storage buckets).
- [x] Run the contents of `supabase/seed.sql` once in the dashboard's **SQL Editor**. A second run fails on duplicate brand IDs. Don't use `db push --include-seed`: it also loads `dev-fixtures.sql`.
- [x] `npm run admin:create -- <email> "<12+ char password>" owner "<Name>"`. The first owner is `dcube.marketing@litensity.com`. **Change its password after the first login**, because it was shared in chat.
- [x] Optional: `npm run samples:load` (removable in one click).
- [ ] `OTP_DEV_LOG=true` in `.env.local`, so OTP codes print in the dev-server terminal while SMTP isn't set up.
- [ ] `npm run dev`

### Local setup (Docker)

- [ ] Docker Desktop is running.
- [ ] `npm run db:start`, then `npm run db:reset` (schema + `seed.sql` + `dev-fixtures.sql`).
- [ ] Point `.env.local` at `http://127.0.0.1:54321` with the keys printed by `db:start`, then do the admin/samples/dev steps above.

Keep these open in tabs:

| Tab | URL |
| --- | --- |
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| Database | Supabase dashboard (hosted) or http://127.0.0.1:54323 (local) |
| Email | Real inbox (hosted, once SMTP works) or Mailpit http://127.0.0.1:54324 (local) |
| Your 5 Google Sheets | Franchise Leads, Downloads, Investor, Recruitment, General Enquiry |

Automated checks to run first:

- [ ] `npm run lint`: no errors or warnings.
- [ ] `npm run typecheck`: no errors.
- [ ] `npm run build`: completes. If it fails with "JavaScript heap out of memory" or exit code `3221226505`, close other apps or stop Docker (`npx supabase stop`); it's the machine's memory, not the code.
- [ ] `node scripts/e2e-forms.mjs`: passes (needs the dev server). **These scripts write test leads into whichever database `.env.local` points to**, so run them against local or staging, never production.
- [ ] `node scripts/e2e-admin.mjs`: passes (needs the dev server and an admin user).
- [ ] `node scripts/e2e-builder.mjs`: passes.
- [ ] `node scripts/shoot.mjs / 390`: no horizontal overflow and no console errors. Repeat for every page in §2. In **Git Bash**, prefix the command with `MSYS_NO_PATHCONV=1`, otherwise `/` is turned into a Windows path.

**Browser tools you'll use:** DevTools (F12) → *Toggle device toolbar* (Ctrl+Shift+M) for mobile widths; *Console* for errors; *Network* to see requests; *Elements* → Ctrl+F to search the HTML.

---

## 1. Google Sheets + email wiring (needed before testing forms)

### Email (Nodemailer → Google Workspace)

All automated emails (acknowledgements, OTP codes, download files, internal alerts) are sent **from `hello@litensity.com`**. litensity.com mail is hosted on **Google Workspace**: its MX records point to `aspmx.l.google.com` and its SPF record includes `_spf.google.com`. The mailbox belongs to the client, so the client has to approve sending once, using one of:

- [ ] **A. App password.** Whoever manages hello@ turns on 2-Step Verification, creates an app password and shares it securely. Then set:
  `SMTP_HOST=smtp.gmail.com` · `SMTP_PORT=587` · `SMTP_SECURE=false` · `SMTP_USER=hello@litensity.com` · `SMTP_PASSWORD=<app password>` · `MAIL_FROM="Litensity <hello@litensity.com>"` · `MAIL_FALLBACK_TO=hello@litensity.com`
- [ ] **B. Sending service (preferred: no password shared).** The domain admin adds the DNS records for a provider such as Brevo or Resend, and the `SMTP_*` values point at that provider.
- [ ] Until one of these is done: leave `SMTP_*` empty and set `OTP_DEV_LOG=true`. OTP codes print in the terminal and other emails are skipped (shown as not sent in Admin → Leads).
- [ ] Once configured: submit one form and check that both the internal alert and the acknowledgement arrive, and aren't in spam.

### Google Sheets

The sheets can live in hello@litensity.com's Google Drive. The site writes to them through a Google Cloud **service account**, not the mailbox password.

- [ ] Each of the 5 sheets is shared as **Editor** with the `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
- [ ] **Admin → Settings → Forms & lead routing** (`/admin/r/forms`). For each form row (franchise, downloads, investor, recruitment, general):
  - [ ] Sheet ID pasted (the long ID in the sheet URL between `/d/` and `/edit`).
  - [ ] Tab name matches the tab in the sheet.
  - [ ] Notify emails filled in with test addresses.
  - [ ] Acknowledgement subject and body filled in.
  - [ ] Dropdown options (budget, timeline, ticket size, enquiry types) filled in. Values marked `[CLIENT CONTENT REQUIRED]` must be replaced before launch.
- [ ] Locally, all email goes to Mailpit. On staging, use real inboxes and also check the spam folder.

---

## 2. Navigation and global elements (PRD §5, §14)

### Header
- [ ] **Site → any page.** The Litensity logo links to `/`.
- [ ] Header links: Brands, Invest, Store Locator, About, CSR, Careers, Contact. Click each one; none should 404.
- [ ] The Brands dropdown lists BIGGUYS, Belgian Waffle and DCube, and each goes to `/brands/<slug>` (`bigguys`, `belgian-waffle`, `dcube`).
- [ ] **Two-click rule:** from Home, every page above is reachable in 2 clicks or fewer.

### Mobile menu (DevTools at 390px wide)
- [ ] The hamburger opens the menu, all links are present, and it closes with the X and with the Esc key.
- [ ] The page behind the open menu doesn't scroll.

### Sticky Enquire / WhatsApp / call
- [ ] The **Enquire** button stays visible on every public page while you scroll: Home, Brands, all 3 brand pages, Invest, Stores, About, CSR, Careers, Contact, Privacy, Terms.
- [ ] Enquire opens the enquiry options or form.
- [ ] On mobile width, WhatsApp opens `wa.me/<number>` and call opens `tel:<number>`.
- [ ] **Admin → Settings → Company & contact:** change the WhatsApp number and save. **Check:** the site uses the new number after a refresh. Then turn the sticky button off and check it disappears, and turn it back on.

### Footer (every page)
- [ ] Corporate address, phone and email.
- [ ] Brand links and brand social handles.
- [ ] Quick menu/brochure links. **Check:** there is NO Belgian Waffle brochure link.
- [ ] Privacy Policy and Terms links work.
- [ ] Newsletter signup: an invalid email shows an error; a valid email shows a success message.

### 404, sitemap, robots, favicon
- [ ] Visit `/this-does-not-exist`: a designed 404 page with a link home appears.
- [ ] Visit `/brands/not-a-brand`: 404.
- [ ] Visit `/sitemap.xml`: lists every public page and all 3 brand pages, with no `/admin` URLs.
- [ ] Visit `/robots.txt`: disallows `/admin`.
- [ ] The browser tab shows the Litensity favicon.

---

## 3. Homepage `/` (PRD §6), in this order

- [ ] **1. Hero:** positioning line, group visual, **Explore Brands** goes to `/brands`, **Invest with Us** goes to `/invest`.
- [ ] **2. House of Brands:** 3 brand tiles, each with a Homegrown/Franchise label, each linking to its brand page.
- [ ] **3. Group Highlights:** brands operated, stores live, cities, states, team size.
- [ ] **4. Footprint Preview:** a compact India map that links to `/stores`.
- [ ] **5. Why Partner:** multi-brand experience, supply chain, marketing, rollout.
- [ ] **6. Founders Preview:** founder photos and names that link to `/about`.
- [ ] **7. CSR Preview:** an image-led band that links to `/csr`.
- [ ] **8. Enquiry band + footer:** investor, careers and contact CTAs work.

**CMS test (do it for the homepage, then repeat on one more page):**
- [ ] **Admin → Pages → Home** (`/admin/pages/home`): change the hero heading and save, then refresh `/`. **Check:** the new text appears.
- [ ] Drag a section to a new position and save. **Check:** the order changes on the site.
- [ ] Hide a section. **Check:** it's gone from the site, not left as an empty gap. Then show it again.
- [ ] Change a CTA label and link. **Check:** the button updates.
- [ ] Replace the hero image. **Check:** the new image appears.
- [ ] **Stats:** edit a stat (Admin → Pages → Home → Highlights). Set "Stores live" to source = *stores_live*. **Check:** the number equals the count of Live stores in the Store Master.
- [ ] **No invented numbers:** any stat without a confirmed value shows nothing or a dev-only placeholder, never a made-up figure.

---

## 4. Our Brands hub `/brands` (PRD §7.1)

- [ ] Intro text about how Litensity builds brands.
- [ ] 3 brand cards, each with a logo, one-line positioning, **store count**, and a Homegrown/Franchise label.
- [ ] Quick links on each card: **View menu** goes to the brand's menu, **Find a store** goes to the locator filtered to that brand, **Enquire to invest** appears only for BIGGUYS and DCube.
- [ ] Comparison strip: format, ticket size range and cities. A ticket size shows only if "confirmed" is ticked in Admin → Brands.
- [ ] Closing CTA goes to the investor enquiry on `/invest`.
- [ ] Store count check: add a Live BIGGUYS store (see §8). **Check:** the BIGGUYS count goes up by 1.

---

## 5. Brand pages: one template, three configurations (PRD §7.2–7.6)

Open `/brands/bigguys`, `/brands/belgian-waffle` and `/brands/dcube` side by side.

### 5.1 Blocks on every brand page
| Block | BIGGUYS | Belgian Waffle | DCube |
| --- | --- | --- | --- |
| Hero: logo, tagline, imagery, brand colours | [ ] | [ ] | [ ] |
| Story: origin, category, differentiation | [ ] | [ ] | [ ] |
| Highlights: stores, cities (plus orders/years if set) | [ ] | [ ] | [ ] |
| Menu & offering: categories, bestsellers, price positioning | [ ] | [ ] | [ ] |
| Store list: address, timings, phone, order links | [ ] | [ ] | [ ] |
| Locator **pre-filtered to this brand** (only this brand's pins) | [ ] | [ ] | [ ] |
| Gallery: interiors, products, campaigns | [ ] | [ ] | [ ] |
| Campaigns / new launches | [ ] | [ ] | [ ] |
| Order / delivery links (Swiggy, Zomato etc.) open in a new tab | [ ] | [ ] | [ ] |
| **Menu download** (OTP) | [ ] | [ ] | [ ] |
| Menu also **viewable on the page** | [ ] | [ ] | [ ] |
| **Brochure download** | [ ] YES | [ ] **ABSENT** | [ ] YES |
| **Investment section** | [ ] YES | [ ] **ABSENT** | [ ] YES |
| **Brand investment form** | [ ] YES | [ ] **ABSENT** | [ ] YES |
| General customer enquiry | — | [ ] YES | — |

### 5.2 Belgian Waffle exclusion test (critical)
- [ ] On `/brands/belgian-waffle`, look for any investment, franchise or brochure block. There must be none: no empty space, no disabled card, no "coming soon".
- [ ] DevTools → Elements → Ctrl+F for `brochure`, `invest`, `franchise`. **Check:** nothing related to Belgian Waffle investment exists in the HTML, including hidden elements.
- [ ] Footer, Brands hub, Downloads area: no Belgian Waffle brochure link anywhere.
- [ ] `/invest` interest-area dropdown: Belgian Waffle is not an option.
- [ ] **Admin → Brands → Belgian Waffle:** try ticking "Brochure download" without "Investment". **Check:** saving is rejected, because the database requires brochure and enquiry to depend on investment.

### 5.3 BIGGUYS specifics (§7.4)
- [ ] Korean-Indian fusion fried chicken positioning, plus the signature range and flavour story.
- [ ] Investment block: models/formats, indicative range, area/site requirement, Litensity support, 6-step process with durations, 8–10 FAQs (accordion opens with mouse and keyboard).
- [ ] The investment form has a **Preferred location** field (not "format").

### 5.4 DCube specifics (§7.5)
- [ ] Craft-your-own positioning and tagline, the product range (waffles, donuts, croissants, ice cream, beverages), and the eggless/customisation story.
- [ ] Store formats (high street, mall kiosk, cloud kitchen) and the Cubicles loyalty programme.
- [ ] Investment models shown **side by side** with format-wise ranges.
- [ ] The investment form has a **Preferred format** dropdown (not "location").
- [ ] Link to dcubedessertscafe.com shows only if "external URL enabled" is on in Admin → Brands → DCube.

### 5.5 Commercial figure safety
- [ ] **Admin → Brand models** (`/admin/r/investment-models`): open a model and untick **"Figures confirmed in writing"**. **Check:** its investment range and payback disappear from the brand page.
- [ ] Tick it again. **Check:** the figures appear.
- [ ] Payback/returns are shown as ranges *with assumptions*, never as a single promise.

### 5.6 Brand CMS tests
- [ ] **Admin → Brands → BIGGUYS:** change the tagline and primary colour and save. **Check:** the hero, pins, cards and buttons use the new colour.
- [ ] Add a product and mark it as a bestseller. **Check:** it appears in Menu & offering.
- [ ] Add a gallery image. **Check:** it appears in the gallery.
- [ ] Add a delivery link. **Check:** it appears.
- [ ] Unpublish a campaign. **Check:** it disappears from the site.
- [ ] Turn off **Menu download** for one brand. **Check:** the menu download button disappears entirely, then turn it back on.

### 5.7 Fourth-brand test (no code change)
- [ ] **Admin → Brands → New brand:** name "Test Brand", slug `test-brand`, colours, ownership, Investment OFF, status **Published**.
- [ ] **Check:** `/brands/test-brand` works, and Test Brand appears in the header dropdown, home House of Brands, `/brands` hub, comparison strip, locator brand filter, footer and `/sitemap.xml`.
- [ ] Add one store for it. **Check:** a pin appears in its colour.
- [ ] Turn investment ON. **Check:** the investment block appears and Test Brand appears in the `/invest` interest dropdown.
- [ ] Delete or unpublish Test Brand afterwards. **Check:** it's gone from every place above.

---

## 6. Store Locator `/stores` (PRD §8)

- [ ] India map loads, with one pin per **Live** store.
- [ ] Pins use each brand's colour.
- [ ] Clicking a pin opens a store card with name, full address, opening hours, phone, **Directions** (opens Google Maps), **Call** (`tel:`), order links and photo if one is set.
- [ ] Zoom works down to state, city and locality.
- [ ] **Brand filter:** choose BIGGUYS. **Check:** only BIGGUYS pins and cards remain, and the result count equals the number of cards.
- [ ] **State filter:** **Check:** results narrow and the count is correct.
- [ ] **City filter:** **Check:** only cities in the chosen state are offered, and the count is correct.
- [ ] Each filter's dropdown option counts match what you get when you pick that option.
- [ ] **Pincode search:** type a known store's pincode. **Check:** that store is found.
- [ ] **Locality search:** type a locality name. **Check:** the store is found.
- [ ] A search with no results shows a helpful empty state with a way to reset filters.
- [ ] **Use my location:** allow permission. **Check:** results are sorted nearest-first and show distances. Deny permission. **Check:** a graceful message, and the list still works.
- [ ] "Opening Soon" stores do **not** appear as live pins (shown separately, if at all).
- [ ] **Mobile (390px):** a List/Map toggle exists, the list is grouped city-wise, cards are easy to tap, and the map doesn't trap scrolling.
- [ ] From a brand page, "Find a store" opens the locator pre-filtered to that brand.

### Store Master: single source of truth test
- [ ] **Admin → Stores** (`/admin/r/stores`) → **New store**: brand BIGGUYS, all required fields (name, address, locality, city, state, pincode, lat/long, hours, phone), status **Live**, upload a photo, and add an order link.
- [ ] Try saving with a required field empty. **Check:** a validation error.
- [ ] **Check:** the new store appears on the `/stores` map pin, in the `/stores` list, in the `/brands/bigguys` store list and locator, in the filter counts, in the `/brands` hub store count, and in the homepage "stores live", cities and states stats (if they are set to live sources).
- [ ] Change its phone number. **Check:** the phone updates everywhere above.
- [ ] Set status to **Opening Soon**. **Check:** the pin disappears and the counts go down.
- [ ] Archive the store. **Check:** it's gone everywhere.
- [ ] Admin store list search and filters (brand, status, archived) work.

---

## 7. Gated downloads + OTP (PRD §9)

Do this for: BIGGUYS menu, Belgian Waffle menu, DCube menu, BIGGUYS brochure, DCube brochure.

| File | Works |
| --- | --- |
| BIGGUYS menu | [ ] |
| Belgian Waffle menu | [ ] |
| DCube menu | [ ] |
| BIGGUYS brochure | [ ] |
| DCube brochure | [ ] |
| Belgian Waffle brochure **does not exist anywhere** | [ ] |

### Happy path
- [ ] Click **Download menu**. **Check:** a dialog opens, focus moves into it, and Esc closes it.
- [ ] The form asks for name, email, mobile and a consent checkbox. The consent text links to Privacy and Terms.
- [ ] Submit empty. **Check:** each field shows an error.
- [ ] Enter a bad email (`abc@`) and a bad phone (`12345`). **Check:** errors appear.
- [ ] Untick consent. **Check:** "Please accept to continue".
- [ ] Submit valid details. **Check:** an OTP is sent and a masked destination is shown, e.g. `p***@gmail.com`.
- [ ] Get the code: with `OTP_DEV_LOG=true` it's in the dev-server terminal; otherwise it's in Mailpit or the real inbox.
- [ ] **Check the Downloads sheet NOW, before verifying:** a new row exists with OTP status **Unverified**, plus brand, file type (Menu/Brochure), source page, source section and timestamp.
- [ ] Enter the code. **Check:** the file opens or downloads.
- [ ] **Check:** the same sheet row now shows **Verified**.
- [ ] **Check Mailpit/inbox:** (a) the visitor gets an email with the file attached (or a link if it's over 10 MB); (b) the internal alert reaches the Downloads notify emails.

### Failure paths
- [ ] Enter a wrong code. **Check:** "That code isn't right. N attempts left."
- [ ] After 5 wrong codes. **Check:** "Too many incorrect attempts. Please start again."
- [ ] Click **Resend** immediately. **Check:** it's disabled or shows "wait N seconds" (45-second cooldown).
- [ ] After 45 seconds, resend works and the new code verifies.
- [ ] More than 4 sends on one request. **Check:** "Too many codes requested."
- [ ] **Phone rate limit:** start more than 3 downloads with the same phone within 10 minutes. **Check:** "Too many verification requests."
- [ ] **IP rate limit:** more than 10 OTP starts from the same browser in 10 minutes (use different phones). **Check:** blocked.
- [ ] **Expiry:** wait over 10 minutes and then enter the code. **Check:** it's rejected as expired.
- [ ] **Abandoned:** start an OTP and close the dialog. **Check:** the sheet row stays **Unverified**.
- [ ] **On-page menu:** inside the dialog, click "View menu on page" (or scroll to the menu block). **Check:** the menu is visible without OTP, so the journey doesn't dead-end.
- [ ] **Link security:** copy the released download URL, wait over 2 minutes, and open it again. **Check:** it no longer works (signed URLs expire).
- [ ] Opening the storage URL of a menu PDF directly (without a token) fails, because the bucket is private.

### Admin control
- [ ] **Admin → Brands → (brand) → Menu & brochure files:** replace the menu PDF. **Check:** the next download delivers the new file.
- [ ] Untick "Require OTP verification" on a file. **Check:** it downloads straight away. Then tick it again.
- [ ] OTP channel: `OTP_CHANNEL=email` in `.env.local`. SMS is ready for a provider adapter once Litensity chooses one (open decision).

---

## 8. The six forms (PRD §15)

For **each form**, do the standard tests below, then the form-specific ones.

### Standard tests (repeat for every form)
- [ ] Required fields are visibly marked (`*` or "required").
- [ ] Submit empty. **Check:** inline errors on each required field, and focus moves to the first error.
- [ ] Invalid email shows an error. Invalid phone (`12345`, `5123456789`) shows an error. A valid Indian mobile (`9876543210`, `+91 98765 43210`) is accepted.
- [ ] **Anti-spam (fill time):** fill and submit in under 2.5 seconds (paste fast). **Check:** rejected.
- [ ] **Anti-spam (honeypot):** DevTools → find the hidden `website` input, type something in it, and submit. **Check:** rejected, and no sheet row is written.
- [ ] **Rate limit:** submit more than 6 times in 10 minutes. **Check:** blocked with a friendly message.
- [ ] Privacy Policy and Terms links are next to the submit button.
- [ ] Valid submit shows a success message (the text comes from Admin → Forms → success message).
- [ ] **Sheet:** a new row in the **correct** sheet (and not in any other) with Timestamp, Intent, Brand, Source page, Source section, Name, Email, Phone, and the form's own fields. Columns after the data are left empty for sales/HR.
- [ ] **Internal email** reaches that form's notify emails (or `MAIL_FALLBACK_TO` if none are set).
- [ ] **Acknowledgement email** reaches the visitor, with the subject and body from Admin → Forms.
- [ ] **Admin → Leads** (`/admin/r/leads`): the submission is listed with sheet ✓ and email ✓ status.
- [ ] Usable at 390px with one thumb: big fields, correct keyboards (email keyboard for email, number pad for phone).

### Form-specific checks
| # | Form | Where | Fields to see | Auto tags to check in the sheet | Sheet |
| --- | --- | --- | --- | --- | --- |
| 1 | BIGGUYS investment | `/brands/bigguys` → investment block | name, phone, email, city, **preferred location**, budget, timeline, message | Brand = BIGGUYS, source page `/brands/bigguys` | Franchise Leads |
| 2 | DCube investment | `/brands/dcube` → investment block | name, phone, email, city, **preferred format**, budget, timeline, message | Brand = DCube | Franchise Leads |
| 3 | Gated download | any brand → Download | name, email, phone, consent | Brand, file type, OTP status | Downloads |
| 4 | Litensity investor | `/invest` | name, organisation, email, phone, city, interest area, investor type, ticket size, timeline, message | source page `/invest` | Investor |
| 5 | Hiring | `/careers` | name, email, phone, role, brand, city, experience, employer, résumé, message | role, source page | Recruitment |
| 6 | General + CSR | `/contact` and `/csr` | name, email, phone, enquiry type, message | enquiry type, source page | General Enquiry |

- [ ] **1 + 2:** both land in Franchise Leads with the correct Brand column. The sheet has both "Preferred location" and "Preferred format" columns.
- [ ] **4 Investor:** interest area options are exactly Group / BIGGUYS / DCube / Not sure yet. Investor type options are Individual / Family office / Institution / Franchise partner.
- [ ] **5 Hiring:**
  - [ ] Click **Apply** on a job. **Check:** the role is pre-filled.
  - [ ] Use the **general application** (no matching role) and check it works too.
  - [ ] Upload a PDF résumé. **Check:** accepted.
  - [ ] Upload a `.exe` or `.jpg`. **Check:** rejected.
  - [ ] Upload a file over 5 MB. **Check:** rejected.
  - [ ] **Recruitment sheet:** the résumé column has a link. Click it while **logged into admin**. **Check:** the file opens.
  - [ ] Open the same link in a private/incognito window (not logged in). **Check:** access is refused.
  - [ ] Also try submitting with a résumé *link* instead of a file.
  - [ ] HR receives the alert email and the candidate receives the acknowledgement.
- [ ] **6 General/CSR:** on `/contact`, the enquiry type dropdown uses the values from Admin → Forms. On `/csr`, the partner form submits with type "CSR partnership". Both land in General Enquiry with the right type.
- [ ] Contact departments (Admin → Settings → Contact departments) route to the right recipients, if configured.

---

## 9. Invest with Us `/invest` (PRD §10.2)

- [ ] Litensity is presented as a multi-brand operator with a homegrown + franchise model.
- [ ] Operating capability: rollout, supply chain, marketing, people (Admin → Pages → Invest, or Repeatable lists → `invest.capabilities`).
- [ ] Portfolio snapshot shows only Litensity-supplied figures.
- [ ] Growth roadmap (`invest.roadmap` list).
- [ ] Governance and leadership credibility.
- [ ] Investor form works (§8, form 4).

---

## 10. About & Founders `/about` (PRD §11)

- [ ] Company story, house-of-brands thinking, vision, 3–4 values, medium-term intent.
- [ ] Milestone timeline in date order.
- [ ] Founder cards show photo, name, designation, background, responsibility, and LinkedIn (if set).
- [ ] All founder photos use the **same crop ratio and background**.
- [ ] **Admin → Founders:** edit a bio. **Check:** it updates on the site.
- [ ] **Admin → Leadership → New:** add a function head with a photo. **Check:** the leadership block appears on `/about` without any redesign. Delete it and check the block disappears cleanly.
- [ ] **Admin → Milestones → New:** **Check:** it slots into the timeline in the correct order.

---

## 11. CSR `/csr` (PRD §13)

- [ ] Hero image plus a 2–3 sentence opening statement.
- [ ] 3–4 focus pillars, each with an icon and short description.
- [ ] Initiative cards show title, location, date, description and 2–3 photos.
- [ ] Impact figures show only Litensity-supplied values.
- [ ] Photo grid: clicking a photo opens a **lightbox**. Arrow keys and Esc work, and focus returns to the photo afterwards.
- [ ] Partner-with-us form works (§8, form 6).
- [ ] **New-initiative test:** **Admin → CSR → Initiatives → New** with title, location, date and description, plus **CSR → Photographs** for 2 photos linked to it. **Check:** a new card appears and the photos show in the grid, with no code or template change.

---

## 12. Careers `/careers` (PRD §12)

- [ ] Why work with Litensity, plus Life at Litensity images (Admin → Team photos).
- [ ] Open roles show title, brand, location and type.
- [ ] A role's description expands and collapses with mouse and keyboard.
- [ ] **New-job test:** **Admin → Open roles → New**, set it to Published/Open. **Check:** it appears on `/careers`. Set it to Closed. **Check:** it disappears. Archive it as well.
- [ ] With no open roles, the page shows an empty state plus the general application.

---

## 13. Contact `/contact` (PRD §14)

- [ ] Corporate address with a map.
- [ ] Department-wise emails and phones. Click-to-call works on mobile, and email links open the mail client.
- [ ] General enquiry form works.
- [ ] Routing shortcuts for franchise, careers and media go to the right places.

---

## 14. Privacy & Terms

- [ ] `/privacy` and `/terms` load with readable typography.
- [ ] Every form (all 6, plus newsletter) links to both.
- [ ] **Admin → Settings → Privacy Policy & Terms:** edit the text. **Check:** the pages update.

---

## 15. Admin panel (PRD §16)

### Authentication and security
- [ ] In an incognito window, visit `/admin`. **Check:** you're redirected to `/admin/login`.
- [ ] Try `/admin/r/stores` and `/admin/settings` while logged out. **Check:** redirected.
- [ ] Wrong password shows an error. Correct password opens the dashboard.
- [ ] Log out, then press Back. **Check:** admin data is not shown.
- [ ] Sign-up is not possible from the login page.
- [ ] **Supabase Auth sign-ups are off.** Dashboard → Authentication → Sign In / Providers → turn off **"Allow new users to sign up"**. `npm run admin:create` and Admin → Users still work afterwards, because they create users with the secret key. **Status: ❌ still on in the hosted project (audit, 9 Oct 2026).** To verify: `GET <SUPABASE_URL>/auth/v1/settings` with the publishable key returns `"disable_signup": true`.
- [ ] The first owner's password (`dcube.marketing@litensity.com`) has been changed from the one shared during setup.
- [ ] **Admin → Users:** invite an **editor**. Log in as the editor. **Check:** owner-only screens such as Users are refused.
- [ ] **Secrets check:** DevTools → Sources (or View Source) → Ctrl+Shift+F for `service_role`, `SMTP_PASSWORD`, `PRIVATE_KEY`, `APP_SECRET`. **Check:** nothing is found.
- [ ] **RLS check:** in Supabase Studio → Table editor, every table shows RLS **enabled**.
- [ ] **RLS check (anon):** a draft/unpublished record does not appear on the public site.

### Dashboard
- [ ] Shows summaries and quick links to Brands, Pages, Stores, Careers, CSR, Investment, Media and Settings.
- [ ] Lists **remaining `[CLIENT CONTENT REQUIRED]` placeholders**. This must be **zero** before launch.
- [ ] **Remove sample content** button. Use it before launch and check that real content is untouched.

### General CMS UX (check on 2–3 different resources)
- [ ] The list has search, filters and status badges.
- [ ] Create, edit, save. **Check:** a "Saved" message appears.
- [ ] A validation error is shown on bad input.
- [ ] Image upload shows progress and a preview.
- [ ] **Draft → Preview → Publish:** set a record to Draft. **Check:** it's not on the public site. Click **"Preview incl. drafts ↗"**. **Check:** it's visible in preview. Exit preview, publish it, and check it's live.
- [ ] Reordering (sort order) changes the order on the site.
- [ ] Empty lists show a friendly empty state.

### Media library (`/admin/media`)
- [ ] Upload an image and a PDF. Replace a file. Reuse the same image on two pages.
- [ ] Résumés do **not** appear as public media and have no public URL.

### Global settings (`/admin/settings`)
- [ ] Company & contact: address, phone, email, WhatsApp, logo, sticky Enquire, analytics ID.
- [ ] Menus: add a header link and a footer link. **Check:** they appear.
- [ ] Social links: change Instagram. **Check:** the footer updates.
- [ ] SEO & sharing: see §16.
- [ ] Every change shows on the site **immediately** after save and refresh.

---

## 16. SEO (PRD §18, CLAUDE §22)

For each public page (right-click → **View Page Source**, then Ctrl+F):
- [ ] `<title>` is unique per page, and each brand page has its own title.
- [ ] `<meta name="description">` is present.
- [ ] `<link rel="canonical">` is present.
- [ ] `og:title`, `og:description`, `og:image` are present. Pages without their own image fall back to the **default social image** in Admin → Settings → SEO & sharing. **Status: ❌ not set yet**, so `/brands`, `/invest`, `/stores`, `/contact`, `/privacy` and `/terms` have no `og:image` (audit, 9 Oct 2026).
- [ ] `<link rel="canonical">`, `og:url` and `/sitemap.xml` use the real domain, not `localhost`. That comes from `NEXT_PUBLIC_SITE_URL`.
- [ ] Exactly **one `<h1>`** per page, and headings don't skip levels (use the HeadingsMap extension or Lighthouse).
- [ ] All images have meaningful `alt` text; decorative images use `alt=""`.
- [ ] **Admin → Settings → SEO & sharing:** change the title of `/csr`. **Check:** the source shows the new title.
- [ ] **Social preview:** paste the URL into opengraph.xyz (or the LinkedIn Post Inspector on staging). **Check:** the image, title and description look right.
- [ ] Analytics: once an ID is configured, the analytics script loads (check the Network tab).

---

## 17. Responsive (PRD §18, CLAUDE §23)

Check **every page** at these widths in the DevTools device toolbar: **360, 390, 768, 1024, 1440, 1920**.
- [ ] No horizontal scroll. In the console, run `document.documentElement.scrollWidth > innerWidth`; it must print `false`.
- [ ] Text is readable; nothing overlaps or is cut off.
- [ ] Tap targets are at least 44px.
- [ ] Forms can be used one-handed.
- [ ] Images aren't stretched or blurry.
- [ ] Map and list are usable on mobile.
- [ ] **Real phones:** test at least one iPhone (Safari) and one Android (Chrome). To reach your dev server, open `http://<your-PC-IP>:3000` on the same Wi-Fi, or use a staging URL. Check every page, one form, one OTP download, the store locator and "use my location".

---

## 18. Motion & accessibility (CLAUDE §8, §27)

- [ ] Scroll reveals are smooth, don't delay content, and cause no layout jumps.
- [ ] **Reduced motion:** DevTools → Ctrl+Shift+P → "Emulate CSS prefers-reduced-motion: reduce", then reload. **Check:** animations are off or minimal and all content is still visible. Also check with the Windows setting: Settings → Accessibility → Visual effects → Animation effects **Off**.
- [ ] The site still looks premium with motion off.
- [ ] **Keyboard only:** Tab through Home, a brand page, `/stores` and a form. **Check:** the focus ring is always visible, the order is logical, and every control can be reached.
- [ ] Dialogs (OTP, lightbox, mobile menu): focus stays inside, Esc closes, and focus returns to the button that opened them.
- [ ] Accordions (FAQs, jobs) work with Enter/Space.
- [ ] Form errors are read out (labels and `aria-describedby`). If possible, test with NVDA (Windows) or VoiceOver on iPhone.
- [ ] Contrast: Lighthouse → Accessibility has no contrast failures.

---

## 19. Performance (PRD §18, CLAUDE §24)

Test on a production build: `npm run build && npm start`.
- [ ] Chrome DevTools → **Lighthouse** → Mobile, for Home, one brand page, `/stores` and `/careers`. Targets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms.
- [ ] Network tab: images are served as WebP/AVIF through `/_next/image`, and images below the fold load lazily.
- [ ] Network → throttle to "Fast 4G" and the site is still usable. The 3D hero doesn't freeze low-end phones.
- [ ] Console has no errors on any page.

---

## 20. Pre-launch content sign-off (PRD §22, §24)

- [ ] Admin dashboard shows **0** `[CLIENT CONTENT REQUIRED]` items.
- [ ] Sample content removed (**Dashboard → Remove sample content**).
- [ ] **No dev data in the production database.** The current hosted project (`gjlstiedcieiweyschcj`) contains data copied from local development: 11 DEV SAMPLE stores, 1 archived "QA Test Store Whitefield", 1 DEV SAMPLE job and 3 placeholder milestones. These are **not** removed by "Remove sample content". Either delete them in Admin (Stores, Open roles, Milestones), or launch on a fresh project loaded with `seed.sql` only.
- [ ] **Database region decided.** The current project is in Tokyo; the README recommends Mumbai for Indian visitors. Moving is easiest before real content is entered: create the new project, `db push`, run `seed.sql`, update `.env.local` and the hosting env vars.
- [ ] `NEXT_PUBLIC_SITE_URL` is set to the production domain on the host.
- [ ] Supabase Auth public sign-ups are off (§15).
- [ ] Default social-share image is set (§16).
- [ ] Search the site for "DEV SAMPLE", "lorem" and "placeholder". **Check:** nothing is found.
- [ ] Every investment, payback, store count, city count and team-size figure has **written confirmation** from Litensity, and "Figures confirmed in writing" is ticked only for those.
- [ ] Real logos, photos, menus and brochures are in place, with no stock or sample images left.
- [ ] Map tiles: production uses a commercial tile provider (or the Google Maps adapter), not default OpenStreetMap tiles.
- [ ] SMTP SPF/DKIM is set for the `MAIL_FROM` domain, so test emails don't land in spam.
- [ ] `OTP_DEV_LOG=false` in production.
- [ ] Nominated recipient emails are confirmed for every form.
- [ ] All open decisions in PRD §21 are answered (OTP channel, map provider, menu gate mandatory, DCube external site, analytics).

---

## 21. Final acceptance (PRD §22): sign off each line

- [ ] Every brand page renders the correct blocks on and off.
- [ ] Belgian Waffle has no investment block and no brochure link anywhere.
- [ ] Menu download works on all 3 brands.
- [ ] Brochure download works on BIGGUYS and DCube only.
- [ ] OTP sends, verifies, resends after the cooldown, and fails gracefully.
- [ ] Abandoned OTP attempts are logged as Unverified.
- [ ] Every store pin opens a card with address, hours, phone and directions.
- [ ] Store filters return correct counts for brand, state and city.
- [ ] All 6 forms submit, write a row to the correct sheet, and fire both emails.
- [ ] Source page and brand tags are correct on every submission.
- [ ] Résumé upload is stored and linked correctly from the sheet row (admin-only access).
- [ ] Every page is tested on a real phone.
- [ ] No placeholder text, dummy images or unconfirmed figures remain.
- [ ] Privacy Policy and Terms are reachable from every form.
- [ ] Admin can update content without a developer.
- [ ] Adding a store updates every public place it should.
- [ ] Adding a CSR initiative needs no new page or template.
- [ ] Adding a job needs no development.
- [ ] A fourth brand can be configured from the CMS without a code change.
