-- =============================================================================
-- Row Level Security + Storage
-- anon: read published content only. admins (is_admin()): full CRUD.
-- Server-only tables (form_settings, lead_submissions, otp_requests, rate_limits)
-- have no anon policies — accessed with the service role from server code.
-- =============================================================================

-- Enable RLS everywhere.
do $$
declare t text;
begin
  foreach t in array array[
    'admin_profiles', 'media', 'site_settings', 'contact_departments', 'navigation_items',
    'seo_metadata', 'pages', 'page_sections', 'brands', 'product_categories', 'products',
    'campaigns', 'delivery_links', 'social_links', 'downloads', 'stores', 'store_hours',
    'store_order_links', 'content_items', 'stats', 'gallery_items', 'investment_models', 'faqs',
    'people', 'milestones', 'csr_initiatives', 'jobs', 'legal_documents', 'form_settings',
    'lead_submissions', 'otp_requests', 'rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Admin full access on every content table.
do $$
declare t text;
begin
  foreach t in array array[
    'media', 'site_settings', 'contact_departments', 'navigation_items', 'seo_metadata', 'pages',
    'page_sections', 'brands', 'product_categories', 'products', 'campaigns', 'delivery_links',
    'social_links', 'downloads', 'stores', 'store_hours', 'store_order_links', 'content_items',
    'stats', 'gallery_items', 'investment_models', 'faqs', 'people', 'milestones',
    'csr_initiatives', 'jobs', 'legal_documents', 'form_settings'
  ] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- Admins can read the delivery log (no writes from the browser).
create policy lead_submissions_admin_read on public.lead_submissions
  for select to authenticated using (public.is_admin());

-- Admin profiles: every admin can see the team; only owners manage it.
create policy admin_profiles_read on public.admin_profiles
  for select to authenticated using (public.is_admin());
create policy admin_profiles_owner_write on public.admin_profiles
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Public read: rows that are always public.
create policy site_settings_public on public.site_settings for select to anon, authenticated using (true);
create policy pages_public on public.pages for select to anon, authenticated using (true);
create policy seo_public on public.seo_metadata for select to anon, authenticated using (true);
create policy media_public on public.media for select to anon, authenticated using (bucket = 'media');

-- Public read: published rows.
do $$
declare t text;
begin
  foreach t in array array[
    'contact_departments', 'navigation_items', 'page_sections', 'brands', 'product_categories',
    'products', 'campaigns', 'delivery_links', 'social_links', 'downloads', 'content_items',
    'stats', 'gallery_items', 'investment_models', 'faqs', 'people', 'milestones',
    'csr_initiatives', 'jobs', 'legal_documents'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (status = ''published'')',
      t || '_public', t
    );
  end loop;
end $$;

-- Store Master: live + opening soon are public; archived rows are not.
create policy stores_public on public.stores
  for select to anon, authenticated using (not is_archived);
create policy store_hours_public on public.store_hours
  for select to anon, authenticated
  using (exists (select 1 from public.stores s where s.id = store_id and not s.is_archived));
create policy store_order_links_public on public.store_order_links
  for select to anon, authenticated
  using (exists (select 1 from public.stores s where s.id = store_id and not s.is_archived));

-- Option lists only (no sheet IDs / recipients) for public forms.
grant select on public.form_options to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Storage buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm']),
  ('documents', 'documents', false, 26214400, array['application/pdf']),
  ('resumes', 'resumes', false, 5242880,
    array['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy media_bucket_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

create policy media_bucket_admin_write on storage.objects
  for all to authenticated
  using (bucket_id in ('media', 'documents') and public.is_admin())
  with check (bucket_id in ('media', 'documents') and public.is_admin());

-- Resumes: written by the server (service role); admins may read via signed URLs.
create policy resumes_admin_read on storage.objects
  for select to authenticated using (bucket_id = 'resumes' and public.is_admin());
