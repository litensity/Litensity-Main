-- =============================================================================
-- Development seed — STRUCTURE ONLY.
-- No business figures are invented. Every unknown value is NULL or marked
-- "[CLIENT CONTENT REQUIRED]". Headline copy is draft copy for client approval.
-- Brand colours are taken from each brand's own logo and website.
-- =============================================================================

-- Brands ----------------------------------------------------------------------
insert into public.brands (
  id, slug, name, ownership, tagline, positioning, category, story_heading, story_body,
  differentiation, format_summary, ticket_size_label, color_primary, color_ink, color_surface,
  typeface, feature_menu_download, feature_brochure_download, feature_investment,
  feature_investment_enquiry, investment_heading, investment_intro, investment_field,
  investment_format_options, external_url, external_url_enabled, sort_order, status
) values
(
  '11111111-1111-4111-8111-111111111111', 'bigguys', 'BIGGUYS', 'franchise',
  'Korean-Indian fried chicken, turned all the way up.',
  'Korean-Indian fusion fried chicken.',
  'Fried chicken · QSR',
  'Seoul crunch. Indian heat.',
  '[CLIENT CONTENT REQUIRED] Origin story of BIGGUYS — how the brand started, the flavour thinking behind the Korean-Indian fusion and what makes the signature range different.',
  '[CLIENT CONTENT REQUIRED] Flavour story and signature range.',
  '[CLIENT CONTENT REQUIRED] Format',
  NULL,
  '#C3002D', '#1A0A0D', '#FFFFFF', 'condensed',
  true, true, true, true,
  'Own a BIGGUYS.',
  '[CLIENT CONTENT REQUIRED] Investment opportunity and value proposition for BIGGUYS partners.',
  'preferred_location', '{}', NULL, false, 1, 'published'
),
(
  '22222222-2222-4222-8222-222222222222', 'belgian-waffle', 'Belgian Waffle', 'franchise',
  '[CLIENT CONTENT REQUIRED] Belgian Waffle tagline',
  '[CLIENT CONTENT REQUIRED] Brand introduction and category positioning.',
  'Waffles · Desserts',
  'Golden, crisp, made to order.',
  '[CLIENT CONTENT REQUIRED] Brand introduction for Belgian Waffle as operated by Litensity.',
  NULL,
  '[CLIENT CONTENT REQUIRED] Format',
  NULL,
  '#FFC10E', '#442619', '#FFFCD5', 'serif',
  true, false, false, false,
  NULL, NULL, 'preferred_location', '{}', NULL, false, 2, 'published'
),
(
  '33333333-3333-4333-8333-333333333333', 'dcube', 'DCube Desserts Cafe', 'homegrown',
  '[CLIENT CONTENT REQUIRED] DCube tagline',
  'Craft-your-own desserts — waffles, donuts, croissants, ice cream and beverages.',
  'Desserts · Café',
  'Dessert, your way.',
  '[CLIENT CONTENT REQUIRED] The DCube story — craft-your-own desserts, the eggless promise and how customisation works in store.',
  '[CLIENT CONTENT REQUIRED] Eggless and customisation story.',
  'High street · Mall kiosk · Cloud kitchen',
  NULL,
  '#013240', '#011C24', '#FFEEBE', 'grotesk',
  true, true, true, true,
  'Bring DCube to your city.',
  '[CLIENT CONTENT REQUIRED] Investment opportunity and value proposition for DCube partners.',
  'preferred_format', '{"High street","Mall kiosk","Cloud kitchen","Not sure yet"}',
  'https://dcubedessertscafe.com', false, 3, 'published'
);

-- 3D hero objects per brand
update public.brands set hero_object = 'chicken' where slug = 'bigguys';
update public.brands set hero_object = 'waffle' where slug = 'belgian-waffle';
update public.brands set hero_object = 'donut' where slug = 'dcube';

-- Product categories (DCube range is given in the brief) -----------------------
insert into public.product_categories (brand_id, name, description, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'Signature fried chicken', '[CLIENT CONTENT REQUIRED]', 1),
  ('11111111-1111-4111-8111-111111111111', 'Sides & dips', '[CLIENT CONTENT REQUIRED]', 2),
  ('22222222-2222-4222-8222-222222222222', 'Waffles', '[CLIENT CONTENT REQUIRED]', 1),
  ('33333333-3333-4333-8333-333333333333', 'Waffles', '[CLIENT CONTENT REQUIRED]', 1),
  ('33333333-3333-4333-8333-333333333333', 'Donuts', '[CLIENT CONTENT REQUIRED]', 2),
  ('33333333-3333-4333-8333-333333333333', 'Croissants', '[CLIENT CONTENT REQUIRED]', 3),
  ('33333333-3333-4333-8333-333333333333', 'Ice cream', '[CLIENT CONTENT REQUIRED]', 4),
  ('33333333-3333-4333-8333-333333333333', 'Beverages', '[CLIENT CONTENT REQUIRED]', 5);

insert into public.products (brand_id, category_id, name, description, is_bestseller, sort_order, status)
select c.brand_id, c.id, '[CLIENT CONTENT REQUIRED] ' || c.name || ' item',
       'Product description, price positioning and photography required.', c.sort_order = 1, c.sort_order, 'draft'
from public.product_categories c;

-- Brand pillars / support / process (structure only) --------------------------
insert into public.content_items (list_key, brand_id, title, body, icon, sort_order) values
  ('brand.pillars', '33333333-3333-4333-8333-333333333333', 'Eggless', '[CLIENT CONTENT REQUIRED]', 'leaf', 1),
  ('brand.pillars', '33333333-3333-4333-8333-333333333333', 'Customisation', '[CLIENT CONTENT REQUIRED]', 'sparkle', 2),
  ('brand.pillars', '11111111-1111-4111-8111-111111111111', 'Korean-Indian fusion', '[CLIENT CONTENT REQUIRED]', 'flame', 1);

insert into public.content_items (list_key, brand_id, title, body, icon, sort_order)
select 'brand.support', b.id, s.title, '[CLIENT CONTENT REQUIRED]', s.icon, s.ord
from public.brands b
cross join (values
  ('Site selection', 'pin', 1), ('Fit-out', 'build', 2), ('Training', 'chef', 3),
  ('Supply chain', 'truck', 4), ('Marketing', 'megaphone', 5), ('Operations', 'gauge', 6)
) as s(title, icon, ord)
where b.feature_investment;

insert into public.content_items (list_key, brand_id, title, body, meta, sort_order)
select 'brand.process', b.id, s.title, '[CLIENT CONTENT REQUIRED]', NULL, s.ord
from public.brands b
cross join (values
  ('Enquiry', 1), ('Discovery call', 2), ('Site & format', 3),
  ('Agreement', 4), ('Fit-out & training', 5), ('Store opening', 6)
) as s(title, ord)
where b.feature_investment;

-- Investment models: drafts, figures unconfirmed --------------------------------
insert into public.investment_models (brand_id, name, format, description, includes, sort_order, status)
values
  ('11111111-1111-4111-8111-111111111111', '[CLIENT CONTENT REQUIRED] Model', NULL, '[CLIENT CONTENT REQUIRED]', '{}', 1, 'draft'),
  ('33333333-3333-4333-8333-333333333333', 'High street', 'High street', '[CLIENT CONTENT REQUIRED]', '{}', 1, 'draft'),
  ('33333333-3333-4333-8333-333333333333', 'Mall kiosk', 'Mall kiosk', '[CLIENT CONTENT REQUIRED]', '{}', 2, 'draft'),
  ('33333333-3333-4333-8333-333333333333', 'Cloud kitchen', 'Cloud kitchen', '[CLIENT CONTENT REQUIRED]', '{}', 3, 'draft');

insert into public.faqs (scope, brand_id, question, answer, sort_order, status)
select 'brand_investment', b.id, q.question, '[CLIENT CONTENT REQUIRED]', q.ord, 'draft'
from public.brands b
cross join (values
  ('Who is eligible to partner with us?', 1),
  ('How long does it take to open a store?', 2),
  ('What does the agreement cover?', 3),
  ('Is territory exclusivity available?', 4)
) as q(question, ord)
where b.feature_investment;

-- Downloads (files uploaded later from Admin → Brands → Downloads) -------------
insert into public.downloads (brand_id, kind, title, requires_otp, status)
select id, 'menu', name || ' menu', true, 'draft' from public.brands;
insert into public.downloads (brand_id, kind, title, requires_otp, status)
select id, 'brochure', name || ' franchise brochure', true, 'draft' from public.brands where feature_brochure_download;

-- Brand stats (per brand, computed from the Store Master where possible) -------
insert into public.stats (scope, brand_id, label, source, value, sort_order)
select 'brand', b.id, s.label, s.source::public.stat_source, NULL, s.ord
from public.brands b
cross join (values ('Stores', 'stores_live', 1), ('Cities', 'cities', 2), ('Orders served', 'manual', 3), ('Years', 'manual', 4)) as s(label, source, ord);

-- Pages ---------------------------------------------------------------------------
insert into public.pages (key, name) values
  ('home', 'Home'), ('brands', 'Our Brands'), ('brand-template', 'Brand pages (all brands)'),
  ('invest', 'Invest with Us'), ('stores', 'Store Locator'), ('about', 'About & Founders'),
  ('csr', 'CSR'), ('careers', 'Careers'), ('contact', 'Contact');

-- Sections: (page, key/anchor, kind, order, tone, layout, eyebrow, heading, subheading, body, cta, cta href, cta2, cta2 href)
insert into public.page_sections (page_key, section_key, kind, sort_order, tone, layout, eyebrow, heading, subheading, body, cta_label, cta_href, cta2_label, cta2_href) values
  -- Home
  ('home', 'hero', 'home_hero', 0, NULL, NULL, 'Litensity Food & Beverages', E'We build brands\n*people crave.*', NULL,
    '[CLIENT CONTENT REQUIRED] Litensity positioning line — one or two sentences on the house of brands.',
    'Explore brands', '/brands', 'Invest with us', '/invest'),
  ('home', 'house-of-brands', 'house_of_brands', 10, NULL, NULL, 'House of brands', 'Three kitchens. One obsession.', NULL,
    '[CLIENT CONTENT REQUIRED] One line on how Litensity builds and operates its brands.', 'All brands', '/brands', NULL, NULL),
  ('home', 'highlights', 'stats', 20, 'ink', NULL, 'The group in numbers', 'Growing, one city at a time.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('home', 'footprint', 'footprint', 30, NULL, NULL, 'Footprint', 'Find us across India.', NULL,
    'Every Litensity store, on one map.', 'Open store locator', '/stores', NULL, NULL),
  ('home', 'partner', 'pillars', 40, 'paper', 'sticky', 'Why partner with Litensity', 'Built to scale. Run to last.', NULL,
    '[CLIENT CONTENT REQUIRED] Multi-brand operating experience summary.', 'Invest with us', '/invest', NULL, NULL),
  ('home', 'founders', 'founders_preview', 50, NULL, NULL, 'Founders', 'The people behind the plate.', NULL,
    '[CLIENT CONTENT REQUIRED] One line introducing the founders.', 'Meet the founders', '/about#founders', NULL, NULL),
  ('home', 'csr', 'image_banner', 60, NULL, NULL, 'Beyond the counter', 'Feeding more than appetite.', NULL,
    '[CLIENT CONTENT REQUIRED] One line on Litensity CSR.', 'See our impact', '/csr', NULL, NULL),
  ('home', 'enquire', 'link_rows', 70, 'ember', NULL, 'Let''s talk', 'Pull up a chair.', NULL, NULL, NULL, NULL, NULL, NULL),
  -- Brands hub
  ('brands', 'intro', 'page_hero', 0, 'paper', 'type', 'Our brands', 'A house of brands, each with its own appetite.', NULL,
    '[CLIENT CONTENT REQUIRED] How Litensity builds and operates brands — homegrown and franchise.', NULL, NULL, NULL, NULL),
  ('brands', 'brands', 'brand_rows', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('brands', 'compare', 'brand_compare', 20, 'cream', NULL, 'At a glance', 'Side by side.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brands', 'closing', 'cta_band', 30, 'ember', NULL, 'Partner with the group', 'Invest in the whole house.', NULL,
    '[CLIENT CONTENT REQUIRED] Closing line for group investors.', 'Investor enquiry', '/invest#enquire', NULL, NULL),
  -- Brand page sections (shared by every brand; order applies to all brands)
  ('brand-template', 'hero', 'brand_hero', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'See the menu', '#menu', 'Find a store', '#stores'),
  ('brand-template', 'story', 'brand_story', 10, NULL, NULL, 'The story', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'highlights', 'brand_highlights', 20, NULL, NULL, 'In numbers', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'menu', 'brand_menu', 30, NULL, NULL, 'Menu & offering', 'On the menu', NULL, NULL, 'Download menu', NULL, NULL, NULL),
  ('brand-template', 'campaigns', 'brand_campaigns', 40, NULL, NULL, 'What''s new', 'Fresh out of the kitchen', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'stores', 'brand_stores', 50, NULL, NULL, 'Find a store', 'Come hungry.', NULL, NULL, 'Open full locator', '/stores', NULL, NULL),
  ('brand-template', 'order', 'brand_order', 60, NULL, NULL, 'Order online', 'Delivered hot.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'gallery', 'brand_gallery', 70, NULL, NULL, 'Gallery', 'Inside the kitchen', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'downloads', 'brand_downloads', 80, NULL, NULL, 'Downloads', 'Take it with you.', NULL,
    'Verify your number or email once and the file is yours.', NULL, NULL, NULL, NULL),
  ('brand-template', 'invest', 'brand_investment', 90, NULL, NULL, 'Investment', NULL, 'Formats to choose from', NULL, 'Download franchise brochure', NULL, NULL, NULL),
  ('brand-template', 'support', 'brand_support', 100, NULL, NULL, 'Support', 'What you get from us', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'process', 'brand_process', 110, NULL, NULL, 'Process', 'Enquiry to opening day', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'faq', 'brand_faq', 120, NULL, NULL, 'FAQ', 'Questions partners ask', NULL, NULL, NULL, NULL, NULL, NULL),
  ('brand-template', 'enquire', 'brand_enquiry', 130, NULL, NULL, 'Enquire', 'Start the conversation.', NULL,
    'Tell us a little about yourself and we will be in touch.', NULL, NULL, NULL, NULL),
  -- Invest (group)
  ('invest', 'hero', 'page_hero', 0, 'ink', 'type', 'Invest with Litensity', 'Back a multi-brand F&B operator.', NULL,
    '[CLIENT CONTENT REQUIRED] Litensity as a multi-brand F&B operating company.', 'Start a conversation', '#enquire', NULL, NULL),
  ('invest', 'model', 'ownership_model', 10, NULL, NULL, 'Our model', 'Homegrown brands. Proven franchises.', NULL,
    '[CLIENT CONTENT REQUIRED] Homegrown and franchise brand model.', NULL, NULL, NULL, NULL),
  ('invest', 'capabilities', 'pillars', 20, 'cream', 'grid-2', 'Operating capability', 'The engine behind every store.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('invest', 'portfolio', 'stats', 30, 'ink', NULL, 'Portfolio snapshot', 'Where we are today.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('invest', 'roadmap', 'timeline', 40, 'paper', NULL, 'Growth roadmap', 'Where we are going.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('invest', 'governance', 'statement', 50, 'cream', NULL, 'Governance', 'Leadership you can underwrite.', NULL,
    '[CLIENT CONTENT REQUIRED] Governance and leadership credibility.', 'Meet the leadership', '/about#leadership', NULL, NULL),
  ('invest', 'brand-partnerships', 'brand_invest_links', 60, NULL, NULL, 'Brand partnerships', 'Prefer a single brand?', NULL, NULL, NULL, NULL, NULL, NULL),
  ('invest', 'faq', 'faq', 70, 'paper', NULL, 'FAQ', 'Questions investors ask', NULL, NULL, NULL, NULL, NULL, NULL),
  ('invest', 'enquire', 'investor_form', 80, NULL, NULL, 'Investor enquiry', 'Let''s build the next chapter together.', NULL,
    '[CLIENT CONTENT REQUIRED] Conversation framing for investors.', NULL, NULL, NULL, NULL),
  -- Stores
  ('stores', 'hero', 'page_hero', 0, 'paper', 'type', 'Store locator', 'Find your nearest Litensity kitchen.', NULL,
    'Filter by brand, state or city — or let us find the closest one.', NULL, NULL, NULL, NULL),
  ('stores', 'locator', 'store_locator', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  -- About
  ('about', 'hero', 'page_hero', 0, 'paper', 'image', 'About Litensity', 'Built on appetite.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'story', 'text_media', 10, 'paper', 'media-right', 'Our story', 'How it started.', NULL,
    '[CLIENT CONTENT REQUIRED] Company story: how Litensity started and why.', NULL, NULL, NULL, NULL),
  ('about', 'thinking', 'statement', 20, 'ink', NULL, 'House of brands', 'Many brands. One way of working.', NULL,
    '[CLIENT CONTENT REQUIRED] House-of-brands thinking.', NULL, NULL, NULL, NULL),
  ('about', 'milestones', 'milestones', 30, 'cream', NULL, 'Milestones', 'The road so far.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'founders', 'founders', 40, NULL, NULL, 'Founders', 'Meet the founders.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'leadership', 'leadership', 50, NULL, NULL, 'Leadership', 'The team running the kitchens.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'vision', 'quote', 60, NULL, NULL, 'Vision', '[CLIENT CONTENT REQUIRED] Vision statement.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'values', 'pillars', 70, 'paper', 'grid-3', 'Values', 'How we operate.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('about', 'intent', 'cta_band', 80, 'ember', NULL, 'What''s next', 'The next five years.', NULL,
    '[CLIENT CONTENT REQUIRED] Medium-term intent.', 'Invest with us', '/invest', NULL, NULL),
  -- CSR
  ('csr', 'hero', 'page_hero', 0, 'ink', 'image', 'Corporate social responsibility', 'Good food. Good work.', NULL,
    '[CLIENT CONTENT REQUIRED] Opening statement in 2–3 sentences.', NULL, NULL, NULL, NULL),
  ('csr', 'focus', 'pillars', 10, 'paper', 'grid-3', 'Focus areas', 'Where we show up.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('csr', 'initiatives', 'csr_initiatives', 20, 'cream', NULL, 'Initiatives', 'On the ground.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('csr', 'impact', 'stats', 30, 'ink', NULL, 'Impact', 'What it adds up to.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('csr', 'gallery', 'csr_gallery', 40, NULL, NULL, 'Gallery', 'Moments that matter.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('csr', 'partner', 'csr_form', 50, NULL, NULL, 'Partner with us', 'Have an initiative in mind?', NULL,
    'NGOs, institutions and companies — tell us how we can work together.', NULL, NULL, NULL, NULL),
  -- Careers
  ('careers', 'hero', 'page_hero', 0, 'paper', 'split', 'Careers', 'Bring your appetite.', NULL,
    '[CLIENT CONTENT REQUIRED] Why work with Litensity.', 'See open roles', '#roles', NULL, NULL),
  ('careers', 'why', 'pillars', 10, 'cream', 'grid-3', 'Why Litensity', 'More than a job on the line.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('careers', 'life', 'careers_gallery', 20, NULL, NULL, 'Life at Litensity', 'Behind the counter.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('careers', 'roles', 'job_list', 30, NULL, NULL, 'Open roles', 'Find your seat.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('careers', 'apply', 'career_form', 40, NULL, NULL, 'General application', 'Don''t see your role?', NULL,
    'Send us your details anyway — we read every application.', NULL, NULL, NULL, NULL),
  -- Contact
  ('contact', 'hero', 'page_hero', 0, 'paper', 'type', 'Contact', 'Say hello.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('contact', 'office', 'contact_hq', 10, NULL, NULL, 'Corporate office', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('contact', 'departments', 'departments', 20, 'cream', NULL, 'Departments', 'Reach the right team.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('contact', 'write', 'contact_form', 30, NULL, NULL, 'General enquiry', 'Write to us.', 'Looking for something specific?', NULL, NULL, NULL, NULL, NULL);

-- Section items (lists that belong to a section) ------------------------------------
insert into public.content_items (section_id, title, body, icon, href, meta, sort_order)
select s.id, i.title, i.body, i.icon, i.href, i.meta, i.ord
from (values
  ('home', 'partner', 'Multi-brand operating experience', '[CLIENT CONTENT REQUIRED]', 'layers', NULL, NULL, 1),
  ('home', 'partner', 'Supply chain', '[CLIENT CONTENT REQUIRED]', 'truck', NULL, NULL, 2),
  ('home', 'partner', 'Marketing', '[CLIENT CONTENT REQUIRED]', 'megaphone', NULL, NULL, 3),
  ('home', 'partner', 'Rollout', '[CLIENT CONTENT REQUIRED]', 'pin', NULL, NULL, 4),
  ('home', 'enquire', 'Investors', 'Partner with the group or a single brand.', NULL, '/invest', NULL, 1),
  ('home', 'enquire', 'Careers', 'Join the team behind the counter.', NULL, '/careers', NULL, 2),
  ('home', 'enquire', 'Everything else', 'Media, vendors, partnerships and feedback.', NULL, '/contact', NULL, 3),
  ('invest', 'capabilities', 'Rollout', '[CLIENT CONTENT REQUIRED]', 'pin', NULL, NULL, 1),
  ('invest', 'capabilities', 'Supply chain', '[CLIENT CONTENT REQUIRED]', 'truck', NULL, NULL, 2),
  ('invest', 'capabilities', 'Marketing', '[CLIENT CONTENT REQUIRED]', 'megaphone', NULL, NULL, 3),
  ('invest', 'capabilities', 'People', '[CLIENT CONTENT REQUIRED]', 'users', NULL, NULL, 4),
  ('invest', 'roadmap', '[CLIENT CONTENT REQUIRED] Roadmap milestone', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 1),
  ('invest', 'faq', 'Who can invest in the Litensity group?', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 1),
  ('invest', 'faq', 'What does the investment process look like?', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 2),
  ('about', 'values', '[CLIENT CONTENT REQUIRED] Value', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 1),
  ('about', 'values', '[CLIENT CONTENT REQUIRED] Value', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 2),
  ('about', 'values', '[CLIENT CONTENT REQUIRED] Value', '[CLIENT CONTENT REQUIRED]', NULL, NULL, NULL, 3),
  ('csr', 'focus', '[CLIENT CONTENT REQUIRED] Focus pillar', '[CLIENT CONTENT REQUIRED]', 'heart', NULL, NULL, 1),
  ('csr', 'focus', '[CLIENT CONTENT REQUIRED] Focus pillar', '[CLIENT CONTENT REQUIRED]', 'leaf', NULL, NULL, 2),
  ('csr', 'focus', '[CLIENT CONTENT REQUIRED] Focus pillar', '[CLIENT CONTENT REQUIRED]', 'users', NULL, NULL, 3),
  ('careers', 'why', '[CLIENT CONTENT REQUIRED] Reason to join', '[CLIENT CONTENT REQUIRED]', 'chef', NULL, NULL, 1),
  ('careers', 'why', '[CLIENT CONTENT REQUIRED] Reason to join', '[CLIENT CONTENT REQUIRED]', 'gauge', NULL, NULL, 2),
  ('careers', 'why', '[CLIENT CONTENT REQUIRED] Reason to join', '[CLIENT CONTENT REQUIRED]', 'users', NULL, NULL, 3),
  ('contact', 'write', 'Franchise & investment', 'Brand franchises and group investment.', NULL, '/invest', NULL, 1),
  ('contact', 'write', 'Careers', 'Open roles and general applications.', NULL, '/careers', NULL, 2),
  ('contact', 'write', 'Find a store', 'Addresses, timings and directions.', NULL, '/stores', NULL, 3)
) as i(page_key, section_key, title, body, icon, href, meta, ord)
join public.page_sections s on s.page_key = i.page_key and s.section_key = i.section_key;

-- Section stats ---------------------------------------------------------------------
insert into public.stats (scope, section_id, label, source, value, sort_order)
select i.page_key, s.id, i.label, i.source::public.stat_source, NULL, i.ord
from (values
  ('home', 'highlights', 'Brands operated', 'brands', 1),
  ('home', 'highlights', 'Stores', 'stores_live', 2),
  ('home', 'highlights', 'Cities', 'cities', 3),
  ('home', 'highlights', 'States', 'states', 4),
  ('home', 'highlights', 'Team members', 'manual', 5),
  ('invest', 'portfolio', 'Brands', 'brands', 1),
  ('invest', 'portfolio', 'Stores', 'stores_live', 2),
  ('invest', 'portfolio', 'Cities', 'cities', 3),
  ('csr', 'impact', '[CLIENT CONTENT REQUIRED] Impact figure', 'manual', 1)
) as i(page_key, section_key, label, source, ord)
join public.page_sections s on s.page_key = i.page_key and s.section_key = i.section_key;

-- Global ------------------------------------------------------------------------
insert into public.site_settings (
  id, company_name, legal_name, positioning_line, address, phone, email, whatsapp_number,
  whatsapp_message, enquire_label, enquire_href, footer_statement, newsletter_enabled, newsletter_heading
) values (
  1, 'Litensity', 'Litensity Food and Beverages Pvt Ltd',
  '[CLIENT CONTENT REQUIRED] Positioning line',
  '[CLIENT CONTENT REQUIRED] Corporate address', NULL, NULL, NULL,
  'Hi Litensity, I have a question.', 'Enquire', '/contact',
  'A house of food brands.', true, 'Fresh launches and new cities, straight to your inbox.'
);

insert into public.contact_departments (name, description, email, phone, sort_order) values
  ('Franchise & investment', '[CLIENT CONTENT REQUIRED]', NULL, NULL, 1),
  ('Careers', '[CLIENT CONTENT REQUIRED]', NULL, NULL, 2),
  ('Media', '[CLIENT CONTENT REQUIRED]', NULL, NULL, 3),
  ('Customer care', '[CLIENT CONTENT REQUIRED]', NULL, NULL, 4);

insert into public.navigation_items (location, label, href, sort_order) values
  ('header', 'Brands', '/brands', 1),
  ('header', 'Invest', '/invest', 2),
  ('header', 'Store Locator', '/stores', 3),
  ('header', 'About', '/about', 4),
  ('header', 'CSR', '/csr', 5),
  ('header', 'Careers', '/careers', 6),
  ('header', 'Contact', '/contact', 7),
  ('footer_explore', 'Our brands', '/brands', 1),
  ('footer_explore', 'Invest with us', '/invest', 2),
  ('footer_explore', 'Store locator', '/stores', 3),
  ('footer_explore', 'About & founders', '/about', 4),
  ('footer_explore', 'CSR', '/csr', 5),
  ('footer_explore', 'Careers', '/careers', 6),
  ('footer_explore', 'Contact', '/contact', 7),
  ('footer_legal', 'Privacy Policy', '/privacy', 1),
  ('footer_legal', 'Terms', '/terms', 2);

insert into public.seo_metadata (route_key, title, description) values
  ('home', 'Litensity Food & Beverages — House of BIGGUYS, Belgian Waffle & DCube', '[CLIENT CONTENT REQUIRED] Home meta description'),
  ('brands', 'Our Brands', 'BIGGUYS, Belgian Waffle and DCube Desserts Cafe — the Litensity house of brands.'),
  ('invest', 'Invest with Us', '[CLIENT CONTENT REQUIRED] Invest meta description'),
  ('stores', 'Store Locator', 'Find a BIGGUYS, Belgian Waffle or DCube Desserts Cafe store near you.'),
  ('about', 'About & Founders', '[CLIENT CONTENT REQUIRED] About meta description'),
  ('csr', 'CSR', '[CLIENT CONTENT REQUIRED] CSR meta description'),
  ('careers', 'Careers', 'Open roles across Litensity and its brands.'),
  ('contact', 'Contact', 'Get in touch with Litensity Food & Beverages.'),
  ('privacy', 'Privacy Policy', 'How Litensity collects and uses your information.'),
  ('terms', 'Terms', 'Terms of use for the Litensity website.'),
  ('brand:bigguys', 'BIGGUYS — Korean-Indian Fried Chicken', '[CLIENT CONTENT REQUIRED] BIGGUYS meta description'),
  ('brand:belgian-waffle', 'Belgian Waffle', '[CLIENT CONTENT REQUIRED] Belgian Waffle meta description'),
  ('brand:dcube', 'DCube Desserts Cafe — Craft-your-own desserts', '[CLIENT CONTENT REQUIRED] DCube meta description');

insert into public.legal_documents (slug, title, body) values
  ('privacy', 'Privacy Policy', E'## [CLIENT CONTENT REQUIRED]\n\nThe approved Privacy Policy must be supplied by Litensity''s legal team before launch.\n\nIt should cover the data collected by enquiry, download, careers and investor forms, how it is stored (Google Sheets, email), retention, and how to request deletion.'),
  ('terms', 'Terms of Use', E'## [CLIENT CONTENT REQUIRED]\n\nThe approved Terms of Use must be supplied by Litensity''s legal team before launch.');

insert into public.form_settings (form_key, label, sheet_tab, notify_emails, ack_subject, ack_body, success_message,
  budget_options, timeline_options, ticket_size_options, enquiry_types) values
  ('franchise', 'Franchise Leads', 'Franchise Leads', '{}', 'Thanks for your interest in {brand}',
    'Thank you for your interest in partnering with {brand}. Our franchise team will review your details and get in touch shortly.',
    'Thank you — our franchise team will be in touch shortly.',
    '{"[CLIENT CONTENT REQUIRED] Budget range"}', '{"Within 3 months","3–6 months","6–12 months","Just exploring"}', '{}', '{}'),
  ('downloads', 'Downloads', 'Downloads', '{}', 'Your {file} from {brand}',
    'Here is the file you requested. You can also view it online any time.', NULL, '{}', '{}', '{}', '{}'),
  ('investor', 'Investor', 'Investor', '{}', 'Thank you for reaching out to Litensity',
    'Thank you for your interest in Litensity. A member of our leadership team will be in touch.',
    'Thank you — our leadership team will be in touch.',
    '{}', '{"Within 3 months","3–6 months","6–12 months","Just exploring"}', '{"[CLIENT CONTENT REQUIRED] Ticket size range"}', '{}'),
  ('recruitment', 'Recruitment', 'Recruitment', '{}', 'We received your application',
    'Thank you for applying to Litensity. Our people team reviews every application and will contact you if there is a match.',
    'Application received — thank you.', '{}', '{}', '{}', '{}'),
  ('general', 'General Enquiry', 'General Enquiry', '{}', 'We received your message',
    'Thank you for writing to Litensity. The right team will get back to you shortly.',
    'Message received — we will be in touch.', '{}', '{}', '{}',
    '{"General","Customer feedback","Media","Vendor / supplier","CSR partnership","Other"}');
