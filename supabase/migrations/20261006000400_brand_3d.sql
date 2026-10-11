-- Per-brand 3D hero object (procedural model rendered by the site; 'none' disables it).
alter table public.brands
  add column hero_object text not null default 'none'
  check (hero_object in ('none', 'chicken', 'waffle', 'donut'));
