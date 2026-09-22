create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read their own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.site_text (
  id uuid primary key default gen_random_uuid(),
  lang text not null,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (lang, key)
);
grant select on public.site_text to anon;
grant select, insert, update, delete on public.site_text to authenticated;
grant all on public.site_text to service_role;
alter table public.site_text enable row level security;
create policy "Anyone can read site text" on public.site_text for select to anon, authenticated using (true);
create policy "Editors manage site text" on public.site_text for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.site_image (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  url text not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_image to anon;
grant select, insert, update, delete on public.site_image to authenticated;
grant all on public.site_image to service_role;
alter table public.site_image enable row level security;
create policy "Anyone can read site images" on public.site_image for select to anon, authenticated using (true);
create policy "Editors manage site images" on public.site_image for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Editors upload site images" on storage.objects for insert to authenticated
with check (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));
create policy "Editors read site images" on storage.objects for select to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));
create policy "Editors update site images" on storage.objects for update to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));