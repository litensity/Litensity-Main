-- Founders and leaders can link an Instagram profile alongside LinkedIn.
alter table public.people
  add column instagram_url text;
