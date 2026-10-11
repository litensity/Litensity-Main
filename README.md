# Litensity — Corporate Website + Admin CMS

Next.js 16 · TypeScript · Supabase (Postgres, Auth, Storage) · Google Sheets (leads) · Nodemailer.

- Product scope: [`PRD.md`](PRD.md) · Engineering rules: [`CLAUDE.md`](CLAUDE.md)
- Architecture, schema and decisions: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- What Litensity still needs to supply: [`docs/CLIENT_INPUTS.md`](docs/CLIENT_INPUTS.md)

---

## Local development

Requirements: Node 20+ (tested on 24), Docker Desktop (for the local Supabase stack).

```bash
npm install
cp .env.example .env.local        # then fill values (see below)
npm run db:start                  # local Supabase: Postgres, Auth, Storage, Studio, Mailpit
npm run db:reset                  # applies migrations + seed.sql + dev-fixtures.sql
npm run admin:create -- you@example.com 'a-long-password' owner "Your Name"
npm run dev                       # http://localhost:3000  ·  admin: /admin
```

`npm run db:start` prints the local anon and service-role keys for `.env.local`.

| Local service | URL |
| --- | --- |
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit (catches all email) | http://127.0.0.1:54324 |

With `OTP_DEV_LOG=true`, OTP codes are printed to the dev-server console instead of being sent.

`supabase/dev-fixtures.sql` adds clearly-labelled **DEV SAMPLE** stores, placeholder founders and a sample job so the
locator, filters and forms can be exercised. It is loaded only by `supabase db reset` locally — never run it against production.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:reset` | Rebuild the local DB from migrations + seeds |
| `npm run db:types` | Regenerate `types/database.ts` after a schema change |
| `npm run admin:create` | Create or promote an admin user |
| `npm run samples:load` | Load removable sample pictures & content (needs internet) |
| `node scripts/e2e-builder.mjs` | Browser test of the page builder (needs dev server + admin) |
| `node scripts/shoot.mjs <path> [width] [name] [--full]` | Screenshot + horizontal-overflow + console-error check |
| `node scripts/e2e-forms.mjs` | Browser test of lead forms (needs dev server) |
| `node scripts/e2e-admin.mjs` | Browser test of the CMS → public site flow (needs dev server + admin) |

---

## Environment variables

See [`.env.example`](.env.example). Anything without `NEXT_PUBLIC_` is server-only and never reaches the browser.

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, used for sitemap, OG tags and links in emails/sheets |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (RLS-protected). The anon key slot takes the dashboard's **publishable** key (`sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — lead delivery, OTP, private files. Takes the dashboard's **secret** key (`sb_secret_…`) |
| `APP_SECRET` | 32+ random chars; HMAC for OTP codes, IPs, release tokens |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Google Sheets writer |
| `SMTP_*`, `MAIL_FROM`, `MAIL_FALLBACK_TO` | Nodemailer |
| `OTP_CHANNEL` | `email` (default) or `sms` once an SMS adapter exists |
| `NEXT_PUBLIC_MAP_TILE_URL` | Map tiles; OSM default is for development only |

---

## Production setup

### 1. Supabase
1. Create a project (Mumbai region recommended). Link it: `npx supabase link --project-ref <ref>`.
2. Apply the schema: `npx supabase db push` (runs `supabase/migrations/*`).
3. Load **only** the structural seed: run `supabase/seed.sql` in the SQL editor. Do **not** run `dev-fixtures.sql`
   (and don't use `db push --include-seed`, which loads both).
4. Authentication → disable public sign-ups (email provider stays enabled for admin login).
5. Create the first owner: `node --env-file=.env.production scripts/create-admin.mjs <email> <password> owner`.

### 2. Google Sheets (lead destinations)
1. Google Cloud → create a service account, enable the **Google Sheets API**, create a JSON key.
2. Put `client_email` and `private_key` into the env vars above.
3. Create the five sheets (Franchise Leads, Downloads, Investor, Recruitment, General Enquiry) and **share each with the
   service-account email as Editor**.
4. Admin → Settings → **Forms & lead routing**: paste each Sheet ID + tab name and the nominated recipient emails.
   Header rows are written automatically; columns after the data are left free for sales/HR status tracking.

Every sheet starts with the same tagging columns — Timestamp, Intent, Brand, Source page, **Source section** (which block of
the page the form or download was used from), Name, Email, Phone — followed by the form's own fields. Franchise rows always
carry both "Preferred location" (BIGGUYS) and "Preferred format" (DCube) so the shared sheet keeps one column layout.

Every submission is also logged in `lead_submissions` (Admin → Leads) with its sheet/email delivery status, so nothing is
lost if Google or SMTP is briefly unavailable. Google Sheets remains the lead destination.

### 3. Email (Nodemailer)
Use the domain's SMTP (Google Workspace, Zoho, SES, etc.). Set SPF/DKIM for the `MAIL_FROM` domain to avoid spam folders.

### 4. Deploy
Any Next.js-capable host (Vercel, Render, a Node server). Set all env vars, then `npm run build && npm start`.
Server-action uploads (résumés) need a 6 MB request body limit (configured in `next.config.ts`).

---

## How content works

### Admin at a glance
| Area | What you do there |
| --- | --- |
| **Pages** | Visual page builder: drag sections to reorder, hide/show, duplicate, delete, add new blocks from a library, edit text/images inline — with a live desktop/tablet/mobile preview. "Brand pages" sets the layout shared by every brand. |
| **Brands** | Identity, colours, story, feature switches; menu, gallery, downloads, campaigns, investment content as related cards. |
| **Stores** | The Store Master (map, lists, filters, counts). |
| About & team, Careers, CSR, Investment | Repeatable records (founders, roles, initiatives, models, FAQs). |
| Leads | Delivery log for every form submission. |
| Settings | Company & contact, forms & sheets, menus, social, departments, SEO, legal, admin users. |

Section types are designed components (`lib/sections/kinds.ts` + `components/sections/*`), so editors control
content, order and visibility while layout quality stays consistent. Heroes are pinned to the top; data-driven blocks
(store locator, forms, founders…) can appear once per page.

### Sample content
`npm run samples:load` fills the site for client previews and is safe to re-run:
- CC0 / public-domain photographs from Wikimedia Commons (credits in each media item's title and in `scripts/sample-content.json`),
  plus a 10-second muted group film loop cut from CC BY 3.0 Commons clips (`scripts/sample-media/`).
- Sample copy, menus with prices, investment formats and ranges, FAQs, founders/leadership, jobs, CSR figures, store names,
  delivery/social links and PDF menus/brochures (`scripts/sample-copy.mjs`).

Inserted rows are tracked in `sample_records`; any existing field it overwrites (usually a `[CLIENT CONTENT REQUIRED]`
placeholder) is saved in `sample_field_backups`. **Admin → Dashboard → Remove sample content** restores those fields
and deletes everything else in one click. **All sample figures are illustrative — never publish them.**

### Content rules
- The site is a **renderer of CMS data**. Copy, imagery, stats, stores, brands, jobs, CSR, FAQs, SEO and settings come
  from Supabase and are edited in `/admin`.
- Saving in the admin revalidates the whole site immediately (ISR fallback: 5 minutes).
- **Draft → Preview → Publish**: records have a status; "Preview incl. drafts" opens the site in draft mode (admins only).
- Values containing `[CLIENT CONTENT REQUIRED]` show as dashed markers in development and are **hidden in production**.
  The admin dashboard lists every remaining placeholder.
- Investment figures render only when "Figures confirmed in writing" is ticked on the model.
- Store counts (stores, cities, states) can be computed live from the Store Master.

### Adding a fourth brand
Admin → Brands → New brand: fill identity, colours, typeface preset and feature switches, set status to Published.
The brand page, nav dropdown, home panels, hub, comparison strip, locator filters, footer and sitemap update automatically.
Then add its stores, menu, gallery and downloads from the brand's edit screen.

---

## Security notes
- RLS on every table; anon reads published rows only; admin access via `admin_profiles` + `is_admin()`.
- Admin pages and actions re-verify the session server-side (`requireAdmin()`); the proxy redirect is only a convenience.
- Service-role key is imported only from `lib/supabase/admin.ts` (`server-only`).
- Menus/brochures live in a private bucket and are released through 2-minute signed URLs after OTP.
- Résumés are private; the Recruitment sheet links to an admin-only endpoint that issues a 60-second signed URL.
- Forms: Zod validation (client + server), honeypot, minimum fill time, per-IP rate limits (Postgres-backed).
- OTP: HMAC-hashed codes, 10-minute expiry, 45-second resend cooldown, 5 attempts, phone/destination/IP limits,
  abandoned attempts remain "Unverified" in the Downloads sheet.
