# Client inputs & open decisions

Everything below is **not invented** by the build. Until supplied, the site shows nothing (production) or a dashed
"client content required" marker (development). The admin dashboard shows a live count of remaining placeholders.

## Decisions needed (PRD §21)

| # | Decision | Current implementation | What changes when decided |
| --- | --- | --- | --- |
| 1 | OTP channel: SMS or email? | Email OTP via SMTP | SMS: pick a DLT-registered provider; implement `smsProvider` in `lib/otp/providers.ts`, set `OTP_CHANNEL=sms` |
| 2 | Map provider | Leaflet + OpenStreetMap tiles (dev) | Production needs a tile provider or a Google Maps adapter in `components/stores/map/`. Note: Indian boundary depiction differs by provider — Google Maps shows India's official boundaries to Indian users; the footprint SVG already uses the India point-of-view dataset |
| 3 | Menu gate: mandatory OTP? | OTP required | Per file: Admin → Brands → Menu & brochure files → "Require OTP" |
| 4 | DCube external site | Link hidden | Admin → Brands → DCube → "Link to external website" |
| 5 | Animation intensity | Moderate (reveals, masked headings, sticky panels, parallax), reduced-motion respected | CSS tokens in `app/styles/tokens.css` |
| 6 | Admin users | One owner + editors | Admin → Admin users |
| 7 | Email recipients per form | `MAIL_FALLBACK_TO` | Admin → Settings → Forms & lead routing |
| 8 | Analytics | GA4 tag when an ID is set | Admin → Global settings → Analytics |
| 9 | Domain / hosting | — | Set `NEXT_PUBLIC_SITE_URL` |
| 10 | Sender mailbox | **Decided:** `hello@litensity.com` (Google Workspace) | Client provides either an app password for hello@ or DNS records for a sending service (Brevo/Resend) — see `docs/QA_CHECKLIST.md` §1 |
| 11 | Database region | Hosted project `gjlstiedcieiweyschcj` in Tokyo (staging) | Mumbai recommended for Indian visitors; move before real content is entered |

## Assumption to confirm
- **Ownership labels** (per the build brief): DCube Desserts Cafe is *Homegrown*; BIGGUYS and Belgian Waffle are
  *Franchise brands operated by Litensity*. BIGGUYS still has the investment/brochure blocks ON, as the brief specifies.
- **Brand colours and typeface presets** are development placeholders until brand guidelines arrive.

## Settings Litensity fills in the admin (from the build brief)
- **Consent wording** for the download gate (brief p.14): Admin → Settings → Forms → Downloads → "Consent checkbox wording".
- **Enquiry routing** (brief p.20/p.25 — e.g. CSR enquiries to the CSR owner, media to PR): Admin → Settings → Contact
  departments → "Receives these enquiry types". That department's email is alerted in addition to the form's recipients.
- **Ticket size** on the brands comparison strip shows only after "Ticket size confirmed in writing by Litensity" is ticked
  on the brand (brief p.2/p.15). Until then it reads "On request".
- **Office coordinates** (Admin → Global settings) — the Contact page map appears once latitude/longitude are set.

## Content required (PRD §20)
- [ ] Brand logos (SVG), colours, fonts
- [ ] Product + store photography per brand; brand hero/card images
- [ ] Menu PDFs (all brands); franchise brochures (BIGGUYS, DCube)
- [ ] Investment models, ranges, area, support, process, FAQs — **with written confirmation for every figure**
- [ ] Company story, vision, values, medium-term intent, milestones
- [ ] Founder photos, names, designations, bios; leadership (optional)
- [ ] Corporate address, phone, email, WhatsApp, department contacts, social handles
- [ ] Store Master: brand, name, address, city, state, pincode, coordinates, hours, phone, order links, photos
- [ ] CSR opening statement, focus areas, initiatives + photos, impact figures
- [ ] Open roles and descriptions; "Life at Litensity" photos
- [ ] Group stats (team size etc.) and brand stats (orders served, years)
- [ ] Privacy Policy and Terms (legal team)
- [ ] SEO descriptions and social preview images
- [ ] Google account access for Sheets; SMTP credentials; nominated recipients

## Before launch
- [ ] Delete all `DEV SAMPLE` data (never load `supabase/dev-fixtures.sql` in production)
- [ ] Admin dashboard → "Content still required" shows zero
- [ ] Each form submitted once on production: sheet row + internal alert + acknowledgement received
- [ ] Every page checked on a real phone (iOS Safari + Android Chrome)
