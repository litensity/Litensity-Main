-- Alignment with the client build brief (Litensity Corporate Website Build Brief).

-- 1. Brief p.2/p.6: BIGGUYS and Belgian Waffle are franchise brands operated by Litensity;
--    DCube Desserts Cafe is the homegrown brand. BIGGUYS was seeded as homegrown in error.
update public.brands set ownership = 'franchise' where slug = 'bigguys' and ownership = 'homegrown';

-- 2. Brief p.2/p.15: no published figure without written confirmation. The comparison-strip
--    ticket size is a commercial figure, so it gets the same gate as investment models.
alter table public.brands
  add column ticket_size_confirmed boolean not null default false;

-- 3. Brief p.14: consent checkbox wording comes from Litensity, so it is editable per form.
alter table public.form_settings
  add column consent_label text;

update public.form_settings
  set consent_label = 'I agree to be contacted by Litensity about this request and for marketing follow-up, and I accept the Privacy Policy.'
  where form_key = 'downloads' and consent_label is null;

create or replace view public.form_options
with (security_invoker = false) as
  select form_key, budget_options, timeline_options, ticket_size_options, enquiry_types,
         success_message, is_enabled, consent_label
  from public.form_settings;

grant select on public.form_options to anon, authenticated;

-- 4. Brief p.20/p.25: general enquiries are routed by type (franchise, careers, media, CSR owner…).
--    A department lists the enquiry types it owns; its email is alerted for those types.
alter table public.contact_departments
  add column enquiry_types text[] not null default '{}';
