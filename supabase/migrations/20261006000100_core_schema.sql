-- =============================================================================
-- Litensity — core schema
-- Content + business data managed from the Admin CMS, Store Master,
-- lead delivery log, OTP and rate limiting.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.brand_ownership as enum ('homegrown', 'franchise');
create type public.store_status as enum ('live', 'opening_soon');
create type public.media_kind as enum ('image', 'video', 'document');
create type public.person_kind as enum ('founder', 'leader');
create type public.download_kind as enum ('menu', 'brochure');
create type public.stat_source as enum ('manual', 'stores_live', 'cities', 'states', 'brands');
create type public.otp_status as enum ('pending', 'verified', 'failed', 'expired');
create type public.admin_role as enum ('owner', 'editor');
create type public.typeface_preset as enum ('serif', 'condensed', 'grotesk');
create type public.investment_field as enum ('preferred_location', 'preferred_format');

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Admin profiles + role check
-- -----------------------------------------------------------------------------
create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admin_profiles where user_id = auth.uid());
$$;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles where user_id = auth.uid() and role = 'owner'
  );
$$;

-- -----------------------------------------------------------------------------
-- Media library
-- -----------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media' check (bucket in ('media', 'documents')),
  path text not null,
  kind public.media_kind not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes >= 0),
  width integer,
  height integer,
  alt text not null default '',
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

-- -----------------------------------------------------------------------------
-- Global settings
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null,
  legal_name text not null,
  positioning_line text,
  address text,
  map_url text,
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  whatsapp_number text,
  whatsapp_message text,
  enquire_label text not null default 'Enquire',
  enquire_href text not null default '/contact',
  footer_statement text,
  newsletter_enabled boolean not null default false,
  newsletter_heading text,
  analytics_measurement_id text,
  logo_media_id uuid references public.media (id) on delete set null,
  default_og_media_id uuid references public.media (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.contact_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  email text,
  phone text,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null check (location in ('header', 'footer_explore', 'footer_legal')),
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.seo_metadata (
  route_key text primary key,
  title text,
  description text,
  og_title text,
  og_description text,
  og_media_id uuid references public.media (id) on delete set null,
  canonical_path text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Pages + sections (copy for fixed page sections)
-- -----------------------------------------------------------------------------
create table public.pages (
  key text primary key,
  name text not null,
  updated_at timestamptz not null default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null references public.pages (key) on delete cascade,
  section_key text not null,
  eyebrow text,
  heading text,
  subheading text,
  body text,
  cta_label text,
  cta_href text,
  cta2_label text,
  cta2_href text,
  media_id uuid references public.media (id) on delete set null,
  video_media_id uuid references public.media (id) on delete set null,
  is_enabled boolean not null default true,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

-- -----------------------------------------------------------------------------
-- Brands
-- -----------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  ownership public.brand_ownership not null,
  tagline text,
  positioning text,
  category text,
  story_heading text,
  story_body text,
  differentiation text,
  format_summary text,
  ticket_size_label text,
  color_primary text not null default '#E0461B' check (color_primary ~ '^#[0-9A-Fa-f]{6}$'),
  color_ink text not null default '#16110D' check (color_ink ~ '^#[0-9A-Fa-f]{6}$'),
  color_surface text not null default '#F3EEE6' check (color_surface ~ '^#[0-9A-Fa-f]{6}$'),
  typeface public.typeface_preset not null default 'serif',
  logo_media_id uuid references public.media (id) on delete set null,
  hero_media_id uuid references public.media (id) on delete set null,
  hero_video_media_id uuid references public.media (id) on delete set null,
  card_media_id uuid references public.media (id) on delete set null,
  external_url text,
  external_url_enabled boolean not null default false,
  -- feature switches (PRD §7.3)
  feature_menu_download boolean not null default true,
  feature_brochure_download boolean not null default false,
  feature_investment boolean not null default false,
  feature_investment_enquiry boolean not null default false,
  investment_heading text,
  investment_intro text,
  investment_field public.investment_field not null default 'preferred_location',
  investment_format_options text[] not null default '{}',
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Brochure + brand investment enquiry require the investment block.
  constraint brands_brochure_requires_investment
    check (not feature_brochure_download or feature_investment),
  constraint brands_enquiry_requires_investment
    check (not feature_investment_enquiry or feature_investment)
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  description text,
  media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  category_id uuid references public.product_categories (id) on delete set null,
  name text not null,
  description text,
  price_label text,
  is_bestseller boolean not null default false,
  is_veg boolean,
  media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  kind text not null default 'campaign' check (kind in ('campaign', 'launch', 'programme')),
  title text not null,
  body text,
  media_id uuid references public.media (id) on delete set null,
  cta_label text,
  cta_href text,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.delivery_links (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands (id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  kind public.download_kind not null,
  title text not null,
  description text,
  file_media_id uuid references public.media (id) on delete set null,
  requires_otp boolean not null default true,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (brand_id, kind)
);

-- -----------------------------------------------------------------------------
-- Store Master
-- -----------------------------------------------------------------------------
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete restrict,
  name text not null,
  address text not null,
  locality text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  phone text not null,
  photo_media_id uuid references public.media (id) on delete set null,
  store_status public.store_status not null default 'live',
  hours_note text,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stores_brand_idx on public.stores (brand_id);
create index stores_city_idx on public.stores (state, city);

create table public.store_hours (
  store_id uuid not null references public.stores (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Monday
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  primary key (store_id, day_of_week),
  check (is_closed or (opens_at is not null and closes_at is not null))
);

create table public.store_order_links (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0
);

-- -----------------------------------------------------------------------------
-- Repeatable content
-- -----------------------------------------------------------------------------
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  list_key text not null,
  brand_id uuid references public.brands (id) on delete cascade,
  title text not null,
  body text,
  meta text,
  icon text,
  href text,
  media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);
create index content_items_list_idx on public.content_items (list_key, brand_id, sort_order);

create table public.stats (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  brand_id uuid references public.brands (id) on delete cascade,
  label text not null,
  source public.stat_source not null default 'manual',
  value text,
  suffix text,
  note text,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);
create index stats_scope_idx on public.stats (scope, brand_id, sort_order);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('brand', 'csr', 'careers', 'about')),
  brand_id uuid references public.brands (id) on delete cascade,
  csr_initiative_id uuid,
  media_id uuid not null references public.media (id) on delete cascade,
  caption text,
  tag text,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.investment_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  format text,
  description text,
  includes text[] not null default '{}',
  investment_range text,
  area_requirement text,
  payback_range text,
  return_range text,
  assumptions text,
  -- Commercial figures render only after written Litensity confirmation.
  figures_confirmed boolean not null default false,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('brand_investment', 'invest', 'careers', 'general')),
  brand_id uuid references public.brands (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  kind public.person_kind not null,
  name text not null,
  designation text,
  background text,
  responsibility text,
  bio text,
  linkedin_url text,
  photo_media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  year_label text not null,
  title text not null,
  body text,
  media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table public.csr_initiatives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  event_date date,
  description text,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  updated_at timestamptz not null default now()
);

alter table public.gallery_items
  add constraint gallery_items_csr_fk
  foreign key (csr_initiative_id) references public.csr_initiatives (id) on delete cascade;

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand_id uuid references public.brands (id) on delete set null,
  location text not null,
  employment_type text not null default 'Full-time',
  summary text,
  description text,
  requirements text,
  is_open boolean not null default true,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.legal_documents (
  slug text primary key check (slug in ('privacy', 'terms')),
  title text not null,
  body text not null,
  status public.publish_status not null default 'published',
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Forms, leads, OTP, rate limiting (server-only)
-- -----------------------------------------------------------------------------
create table public.form_settings (
  form_key text primary key
    check (form_key in ('franchise', 'downloads', 'investor', 'recruitment', 'general')),
  label text not null,
  sheet_id text,
  sheet_tab text not null,
  notify_emails text[] not null default '{}',
  ack_subject text,
  ack_body text,
  success_message text,
  budget_options text[] not null default '{}',
  timeline_options text[] not null default '{}',
  ticket_size_options text[] not null default '{}',
  enquiry_types text[] not null default '{}',
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Public, non-sensitive option lists exposed through a view.
create view public.form_options
with (security_invoker = false) as
  select form_key, budget_options, timeline_options, ticket_size_options, enquiry_types,
         success_message, is_enabled
  from public.form_settings;

create table public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  form_key text not null,
  brand_slug text,
  source_page text,
  email text,
  phone text,
  payload jsonb not null,
  sheet_status text not null default 'pending' check (sheet_status in ('pending', 'sent', 'failed', 'skipped')),
  sheet_range text,
  sheet_error text,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'skipped')),
  email_error text,
  created_at timestamptz not null default now()
);
create index lead_submissions_created_idx on public.lead_submissions (created_at desc);

create table public.otp_requests (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'sms')),
  destination text not null,
  code_hash text not null,
  download_id uuid not null references public.downloads (id) on delete cascade,
  lead_submission_id uuid references public.lead_submissions (id) on delete set null,
  ip_hash text not null,
  attempts smallint not null default 0,
  max_attempts smallint not null default 5,
  send_count smallint not null default 1,
  status public.otp_status not null default 'pending',
  expires_at timestamptz not null,
  last_sent_at timestamptz not null default now(),
  verified_at timestamptz,
  release_token_hash text,
  release_expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index otp_requests_destination_idx on public.otp_requests (destination, created_at desc);

create table public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

-- Atomic fixed-window rate limiter. Returns true when the request is allowed.
create or replace function public.rate_limit_hit(p_bucket text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits as r (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;

  -- opportunistic cleanup of old windows
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_max;
end $$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'media', 'site_settings', 'contact_departments', 'navigation_items', 'seo_metadata', 'pages',
    'page_sections', 'brands', 'product_categories', 'products', 'campaigns', 'delivery_links',
    'social_links', 'downloads', 'stores', 'content_items', 'stats', 'gallery_items',
    'investment_models', 'faqs', 'people', 'milestones', 'csr_initiatives', 'jobs',
    'legal_documents', 'form_settings'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      t || '_touch', t
    );
  end loop;
end $$;
