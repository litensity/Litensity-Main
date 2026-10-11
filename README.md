# Litensity Website — How to Use It

This is the guide to the Litensity Food and Beverages website and its **Admin panel**. The website covers the group
and its three brands: **BIGGUYS**, **Belgian Waffle** and **DCube Desserts Cafe**.

You don't need a developer to keep the site up to date. Stores, brands, jobs, CSR stories, photos, page text, menus
and contact details are all edited in the Admin panel. Changes appear on the live website as soon as you publish them.

> **Developers:** setup, hosting and technical notes are in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

---

## Contents

1. [What's on the website](#1-whats-on-the-website)
2. [Logging in to the Admin panel](#2-logging-in-to-the-admin-panel)
3. [A tour of the Admin panel](#3-a-tour-of-the-admin-panel)
4. [Everyday tasks, step by step](#4-everyday-tasks-step-by-step)
5. [Where enquiries go](#5-where-enquiries-go)
6. [Golden rules](#6-golden-rules)
7. [Common questions](#7-common-questions)
8. [What we still need from Litensity](#8-what-we-still-need-from-litensity)

---

## 1. What's on the website

| Page | Address | What visitors do there |
| --- | --- | --- |
| Home | `/` | Meet the group, see the three brands, store map, founders and CSR |
| Our Brands | `/brands` | Compare brands; jump to a menu, a store or an investment enquiry |
| Brand pages | `/brands/bigguys`, `/brands/belgian-waffle`, `/brands/dcube` | Story, menu, stores, gallery, order links, downloads, investment (BIGGUYS and DCube only) |
| Invest with Us | `/invest` | Group investor story and the investor enquiry form |
| Store Locator | `/stores` | Map of India with every store; filter by brand, state or city; search by pincode; "near me" |
| About & Founders | `/about` | Company story, milestones, founders and leadership |
| CSR | `/csr` | Focus areas, initiatives with photos, impact figures, partner enquiry form |
| Careers | `/careers` | Open roles and the application form (with résumé upload) |
| Contact | `/contact` | Office address and map, department contacts, general enquiry form |
| Privacy Policy / Terms | `/privacy`, `/terms` | Legal pages, linked from every form |

On every page visitors also get:
- a sticky **Enquire** button;
- on phones, quick **WhatsApp** and **Call** buttons;
- the footer with social links, menu and brochure shortcuts, and the legal pages.

**Menus and brochures:** visitors enter their name, email and phone, then confirm a one-time code (OTP) before the
file downloads. Every download is recorded as a lead. Menus can also be browsed on the brand page without
downloading anything.

**Belgian Waffle** has no investment section, no franchise brochure and no investment form. These are switched off
on purpose and don't appear anywhere on its page.

---

## 2. Logging in to the Admin panel

1. Go to your website address followed by **`/admin`** (for example `https://www.litensity.com/admin`).
2. Sign in with the email and password you were given.
3. You'll land on the **Dashboard**.

- **Owners** can add or remove other admin users.
- **Editors** can change all website content but can't manage users.

To add a colleague, go to **Admin users** (owners only) and use **Add an admin**.

> Keep passwords private, and change any password that was ever shared by email or chat.

---

## 3. A tour of the Admin panel

The menu on the left is organised by task.

| Menu item | What you do there |
| --- | --- |
| **Dashboard** | Today's numbers (live stores, open roles, leads this week, drafts waiting) and recent leads. **Content still required** lists every placeholder that still needs real content. |
| **Pages** | Edit the text, images and order of sections on each page, with a live desktop / tablet / mobile preview beside the editor. **Brand page labels** sets the layout shared by all brands. |
| **Brands** | Each brand's name, logo, colours, story and on/off switches. Its menu, gallery, order links, downloads and investment content are listed underneath. |
| **Stores** | The **Store Master**: one list of every store, which drives the map, the brand pages, the filters and the store counts. |
| **Media library** | Every image, video and PDF that has been uploaded. Search, reuse or replace files. |
| About & team → **Founders, Leadership, Milestones** | People profiles and the company timeline on the About page. |
| Careers → **Open roles, Team photos** | Job listings and the "Life at Litensity" photos. |
| CSR → **Initiatives, Photographs** | One record per CSR initiative, with its photos. |
| Investment → **Brand models, Brand FAQs** | Franchise models and FAQs for BIGGUYS and DCube. |
| Inbox → **Leads** | A record of every form submission and whether it reached its Google Sheet and email. |
| Inbox → **Export to Excel** | Download enquiries as an Excel file, filtered by form, brand and date. |
| **Settings** | Company & contact details, forms & lead routing, header/footer menus, social links, contact departments, SEO & sharing, Privacy Policy & Terms. |

### Draft, Published, Archived

Most records have a **Status**:
- **Draft**: saved, but only visible to admins in preview.
- **Published**: live on the website.
- **Archived**: hidden from the website but kept, so you can bring it back later.

To check a draft before it goes live, open the record and click **Preview incl. drafts ↗**.

### Ordering

Lists with an **Order** number show the lowest number first. Some lists can also be dragged into order.

### Text formatting

- Wrap words in `*asterisks*` to show them in the italic accent style.
- Leave a blank line between paragraphs.
- A new line inside a heading forces a line break.

---

## 4. Everyday tasks, step by step

### Edit text or images on a page
1. **Pages** → choose the page.
2. Click a section in the list. Edit its heading, text, buttons or image. The preview updates as you type.
3. Use the section buttons to **move up or down**, **duplicate**, **hide** or **delete** it.
4. Click **+ Add section** to add a new block from the library. The choices include text and image, statement,
   quote, numbers, timeline, FAQ, photo gallery, call-to-action band and image banner.
5. Save. The change is live straight away.

> Sections such as the store locator, forms and founders fill themselves from data elsewhere in the Admin panel. They
> show a link (for example "Edit stores") that takes you to the right place.

### Add or update a store
1. **Stores** → **New store**, or click an existing store.
2. Fill in the brand, store name, status, phone, full address, city, state, pincode, opening hours and (optionally)
   a photo.
3. **Latitude and longitude:** in Google Maps, right-click the store and click the numbers at the top of the menu to
   copy them.
4. Set **Status**:
   - **Live** puts the store on the map.
   - **Opening soon** lists the store without a map pin.
5. Optionally add **Order online links** (Swiggy, Zomato and so on) underneath.
6. Save. The map, the brand page, the filters and the store counts all update together.

To close a store, tick **Archived** rather than deleting it.

### Post a job
1. Careers → **Open roles** → **New role**.
2. Add the job title, brand (leave it empty for group roles), location, type and description.
3. Set **Status** to **Published** and make sure **Accepting applications** is ticked.

To close the role, untick **Accepting applications** or archive it.

### Add a CSR initiative
1. CSR → **Initiatives** → **New initiative**. Add the title, location, date and description.
2. Save, then add 2–3 photos under **Photographs** on the same screen.
3. Publish. It appears on the CSR page automatically, with no new page needed.

### Replace a menu or brochure PDF
1. **Brands** → choose the brand → **Menu & brochure files**.
2. Open the file and upload the new PDF.
3. **Require OTP verification** controls whether visitors must confirm a code before downloading.

Brochures only appear on brands whose investment block and brochure download are switched on.

### Update investment figures
1. Investment → **Brand models** (or **Brands** → the brand → **Investment models**).
2. Enter the range, area requirement, payback and return ranges, and any assumptions.
3. Tick **Figures confirmed in writing by Litensity** only once you have that confirmation. Until it's ticked, the
   figures never appear on the website.

### Change a number (stores, cities, team size…)
- Numbers are edited inside the **Numbers** section of a page, or under **Brands** → the brand → **Brand numbers**.
- Store, city and state counts can be set to **Auto**, which counts them from the Store Master so they never go out
  of date.
- Leave a value empty to hide that number.

### Change contact details, WhatsApp, social links or the footer
**Settings** →
- **Company & contact**: address, phone, email, WhatsApp, the sticky Enquire button and analytics.
- **Contact departments**: department emails and phones. You can also set which enquiry types each department is
  alerted about.
- **Social links**: links for the group and for each brand.
- **Menus**: header and footer links.

### Change how a page appears on Google and when shared
**Settings** → **SEO & sharing**: the search title (about 50–60 characters), the description (about 150–160
characters) and the social preview image for each page.

### Add a new (fourth) brand
1. **Brands** → **New brand**. Fill in the identity, logo, colours, typeface style, story and the on/off **Features**
   (menu download, investment block, brochure, investment enquiry).
2. Set **Status** to **Published**.
3. The brand page, navigation, home page panels, brands hub, comparison table, map filters, footer and sitemap all
   update on their own.
4. Then add its stores, menu, gallery and downloads.

No developer is needed for any of this.

---

## 5. Where enquiries go

There are six ways visitors can get in touch. Each one goes to **its own Google Sheet**, sends an **alert email to
your team** and sends a **thank-you email to the visitor**. Emails are sent from **hello@litensity.com**.

| Form | Where it is | Google Sheet |
| --- | --- | --- |
| BIGGUYS investment | BIGGUYS brand page | Franchise Leads |
| DCube investment | DCube brand page | Franchise Leads |
| Menu / brochure download | Every brand page (behind OTP) | Downloads |
| Litensity investor | Invest with Us | Investor |
| Job application | Careers (with résumé upload) | Recruitment |
| General + CSR enquiry | Contact, CSR | General Enquiry |

- Every row records the brand, the page and section it came from, and the date and time, without the visitor typing
  any of it.
- Columns to the right of the data are left empty for your team's own status tracking.
- Résumés are kept private. The Recruitment sheet links to them, and only logged-in admins can open the link.
- A download where the visitor never entered the code is still recorded and marked **Unverified**.

**To choose who receives alerts:** **Settings** → **Forms & lead routing** → choose the form → set the
**Internal recipients**, one email per line. You can also change the thank-you email text and the dropdown options
(budget, timeline and so on).

**If something didn't arrive:** **Inbox → Leads** shows every submission with a **Sheet** and **Email** status (sent,
failed, skipped). Nothing is lost if Google or email is briefly down: the lead is always saved there.
**Export to Excel** gives you a copy at any time.

---

## 6. Golden rules

1. **Never publish a figure that Litensity hasn't confirmed in writing.** This covers investment amounts, returns,
   payback, store counts and team size. The site is built to hide unconfirmed figures; please keep it that way.
2. **Placeholders are hidden, not shown.** Any field that still says `[CLIENT CONTENT REQUIRED]` doesn't appear on
   the live site. The Dashboard lists them all under **Content still required**.
3. **Archive rather than delete.** Archived stores, jobs and initiatives can be brought back later.
4. **Add alt text to images.** Alt text is a short description used by screen readers and search engines.
5. **Use good photos.** Upload landscape images at least 2000 px wide where possible, and keep founder photos in the
   same crop and style.
6. **Sample content is for previews only.** Before launch, use **Dashboard → Remove sample content** to clear all
   sample pictures, figures and text in one click.

---

## 7. Common questions

**I saved a change but don't see it on the website.**
Check that its **Status** is **Published** and, for page sections, that the section isn't hidden. Then refresh the
page. If you still don't see it, wait a few minutes; changes can take up to five minutes to show.

**A section is missing from a brand page.**
Some sections only appear when they have content, or when the brand's **Features** switch is on. For example, the
investment block needs **Investment / franchise block** switched on, plus published investment models.

**Why is an investment figure not showing?**
**Figures confirmed in writing by Litensity** hasn't been ticked on that model.

**Why does the comparison table say "On request"?**
**Ticket size confirmed in writing by Litensity** hasn't been ticked on the brand.

**I forgot my password.**
Ask an owner, or your developer, to reset it. There is no self-service reset yet.

**Can I change fonts, colours or layouts freely?**
Brand colours and typeface style are set per brand, and sections can be reordered, added or hidden. The design itself
(spacing, animation, typography) is fixed on purpose, so the site keeps looking premium whoever edits it.

---

## 8. What we still need from Litensity

The full checklist is in [`docs/CLIENT_INPUTS.md`](docs/CLIENT_INPUTS.md). In short:

- **Accounts:** Google access for the five lead sheets; an email password or sending setup for
  **hello@litensity.com**; the domain and hosting.
- **Decisions:**
  - OTP by email (current) or by SMS;
  - which map provider to use for launch;
  - whether menu downloads must stay behind OTP;
  - whether to link to dcubedessertscafe.com;
  - who receives alerts for each form;
  - which analytics account to use.
- **Content:**
  - edited DCube photos (only camera RAW files so far) and Belgian Waffle photos;
  - menu PDFs and franchise brochures;
  - investment figures, with written confirmation;
  - company story, milestones, founder photos and bios;
  - CSR stories and photos;
  - open roles;
  - Privacy Policy and Terms text.

Before launch: sample content removed, **Content still required** at zero, each form tested once on the live site,
and every page checked on a real phone.
