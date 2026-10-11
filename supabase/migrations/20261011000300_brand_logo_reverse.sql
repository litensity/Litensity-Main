-- A second brand logo for use on the brand's own primary colour (the brand hero).
-- The primary logo stays the one shown on light surfaces (brand hub, cards); when no reverse
-- logo is set the hero falls back to the primary logo.
alter table public.brands
  add column logo_reverse_media_id uuid references public.media (id) on delete set null;

comment on column public.brands.logo_reverse_media_id is 'Logo variant legible on color_primary (brand hero). Falls back to logo_media_id.';
