-- =============================================================================
-- Section builder: pages become an ordered list of typed sections that editors
-- can reorder, hide, duplicate, add and delete. Each `kind` maps to a designed
-- component in code (lib/sections/kinds.ts), so layout quality stays controlled.
-- =============================================================================

alter table public.page_sections
  add column kind text not null default 'statement',
  add column sort_order integer not null default 0,
  add column tone text check (tone in ('paper', 'cream', 'ink', 'ember', 'brand')),
  add column layout text;

create index page_sections_order_idx on public.page_sections (page_key, sort_order);

-- Repeatable items and stats can belong to a page section (duplicated with it).
alter table public.content_items
  add column section_id uuid references public.page_sections (id) on delete cascade,
  alter column list_key drop not null;
create index content_items_section_idx on public.content_items (section_id, sort_order);

alter table public.stats add column section_id uuid references public.page_sections (id) on delete cascade;
create index stats_section_idx on public.stats (section_id, sort_order);

alter table public.content_items
  add constraint content_items_owner check (list_key is not null or section_id is not null);

-- -----------------------------------------------------------------------------
-- Map existing fixed sections to kinds + order (no-op on an empty database).
-- -----------------------------------------------------------------------------
update public.page_sections s set kind = m.kind, sort_order = m.ord, tone = m.tone, layout = m.layout
from (values
  ('home', 'hero', 'home_hero', 0, null, null),
  ('home', 'brands', 'house_of_brands', 10, null, null),
  ('home', 'highlights', 'stats', 20, 'ink', null),
  ('home', 'footprint', 'footprint', 30, null, null),
  ('home', 'partner', 'pillars', 40, 'paper', 'sticky'),
  ('home', 'founders', 'founders_preview', 50, null, null),
  ('home', 'csr', 'image_banner', 60, null, null),
  ('home', 'enquiry', 'link_rows', 70, 'ember', null),
  ('brands', 'intro', 'page_hero', 0, 'paper', 'type'),
  ('brands', 'compare', 'brand_compare', 20, null, null),
  ('brands', 'closing', 'cta_band', 30, 'ember', null),
  ('invest', 'hero', 'page_hero', 0, 'ink', 'type'),
  ('invest', 'model', 'ownership_model', 10, null, null),
  ('invest', 'capabilities', 'pillars', 20, 'cream', 'grid-2'),
  ('invest', 'portfolio', 'stats', 30, 'ink', null),
  ('invest', 'roadmap', 'timeline', 40, null, null),
  ('invest', 'governance', 'statement', 50, 'cream', null),
  ('invest', 'brands', 'brand_invest_links', 60, null, null),
  ('invest', 'faq', 'faq', 70, null, null),
  ('invest', 'enquiry', 'investor_form', 80, null, null),
  ('stores', 'hero', 'page_hero', 0, 'paper', 'type'),
  ('about', 'hero', 'page_hero', 0, 'paper', 'image'),
  ('about', 'story', 'text_media', 10, 'paper', 'media-right'),
  ('about', 'thinking', 'statement', 20, 'ink', null),
  ('about', 'milestones', 'milestones', 30, null, null),
  ('about', 'founders', 'founders', 40, null, null),
  ('about', 'leadership', 'leadership', 50, null, null),
  ('about', 'vision', 'quote', 60, null, null),
  ('about', 'values', 'pillars', 70, 'paper', 'grid-3'),
  ('about', 'intent', 'cta_band', 80, 'ember', null),
  ('csr', 'hero', 'page_hero', 0, 'ink', 'image'),
  ('csr', 'focus', 'pillars', 10, 'paper', 'grid-3'),
  ('csr', 'initiatives', 'csr_initiatives', 20, null, null),
  ('csr', 'impact', 'stats', 30, 'ink', null),
  ('csr', 'gallery', 'csr_gallery', 40, null, null),
  ('csr', 'partner', 'csr_form', 50, null, null),
  ('careers', 'hero', 'page_hero', 0, 'paper', 'split'),
  ('careers', 'why', 'pillars', 10, 'cream', 'grid-3'),
  ('careers', 'life', 'careers_gallery', 20, null, null),
  ('careers', 'roles', 'job_list', 30, null, null),
  ('careers', 'apply', 'career_form', 40, null, null),
  ('contact', 'hero', 'page_hero', 0, 'paper', 'type'),
  ('contact', 'departments', 'departments', 20, null, null),
  ('contact', 'form', 'contact_form', 30, null, null),
  ('brand-template', 'story', 'brand_story', 10, null, null),
  ('brand-template', 'highlights', 'brand_highlights', 20, null, null),
  ('brand-template', 'menu', 'brand_menu', 30, null, null),
  ('brand-template', 'campaigns', 'brand_campaigns', 40, null, null),
  ('brand-template', 'stores', 'brand_stores', 50, null, null),
  ('brand-template', 'order', 'brand_order', 60, null, null),
  ('brand-template', 'gallery', 'brand_gallery', 70, null, null),
  ('brand-template', 'downloads', 'brand_downloads', 80, null, null),
  ('brand-template', 'investment', 'brand_investment', 90, null, null),
  ('brand-template', 'support', 'brand_support', 100, null, null),
  ('brand-template', 'process', 'brand_process', 110, null, null),
  ('brand-template', 'faq', 'brand_faq', 120, null, null),
  ('brand-template', 'enquiry', 'brand_enquiry', 130, null, null)
) as m(page_key, section_key, kind, ord, tone, layout)
where s.page_key = m.page_key and s.section_key = m.section_key;

-- Attach existing page-level lists/stats to their sections.
update public.content_items c set section_id = s.id, list_key = null
from (values
  ('home.why_partner', 'home', 'partner'),
  ('home.enquiry_paths', 'home', 'enquiry'),
  ('invest.capabilities', 'invest', 'capabilities'),
  ('invest.roadmap', 'invest', 'roadmap'),
  ('about.values', 'about', 'values'),
  ('csr.focus', 'csr', 'focus'),
  ('careers.why', 'careers', 'why'),
  ('contact.routing', 'contact', 'form')
) as m(list_key, page_key, section_key)
join public.page_sections s on s.page_key = m.page_key and s.section_key = m.section_key
where c.list_key = m.list_key and c.brand_id is null;

update public.stats t set section_id = s.id
from (values ('home', 'home', 'highlights'), ('invest', 'invest', 'portfolio'), ('csr', 'csr', 'impact')) as m(scope, page_key, section_key)
join public.page_sections s on s.page_key = m.page_key and s.section_key = m.section_key
where t.scope = m.scope and t.brand_id is null;

-- Group investor FAQs become items of the invest FAQ section.
insert into public.content_items (section_id, title, body, sort_order, status)
select s.id, f.question, f.answer, f.sort_order, f.status
from public.faqs f join public.page_sections s on s.page_key = 'invest' and s.section_key = 'faq'
where f.scope = 'invest';
delete from public.faqs where scope = 'invest';

-- -----------------------------------------------------------------------------
-- Sample content registry: everything inserted as sample data is recorded here
-- so it can be removed in one click from the admin.
-- -----------------------------------------------------------------------------
create table public.sample_records (
  table_name text not null,
  record_id text not null,
  created_at timestamptz not null default now(),
  primary key (table_name, record_id)
);
alter table public.sample_records enable row level security;
create policy sample_records_admin on public.sample_records
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Atomically rewrites the order of a page's sections.
create or replace function public.reorder_page_sections(p_page_key text, p_ids uuid[])
returns void
language plpgsql security invoker set search_path = public
as $$
begin
  update public.page_sections s
  set sort_order = o.ord * 10
  from unnest(p_ids) with ordinality as o(id, ord)
  where s.id = o.id and s.page_key = p_page_key;
end $$;
