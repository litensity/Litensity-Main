-- -----------------------------------------------------------------------------
-- Sample content, part 2: when the sample loader writes preview copy or figures
-- into an EXISTING row (e.g. replacing a "[CLIENT CONTENT REQUIRED]" placeholder),
-- the original value is kept here. "Remove sample content" in the admin restores
-- every backed-up field before deleting the rows listed in sample_records.
-- -----------------------------------------------------------------------------
create table public.sample_field_backups (
  table_name text not null,
  pk_column text not null default 'id',
  pk_value text not null,
  column_name text not null,
  original jsonb,
  created_at timestamptz not null default now(),
  primary key (table_name, pk_value, column_name)
);

alter table public.sample_field_backups enable row level security;

create policy sample_field_backups_admin on public.sample_field_backups
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
