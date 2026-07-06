-- Nova Cash · Migración 001 · profiles + utilidades compartidas
-- Cap. 4.4 / 5.7 / 9. Toda tabla: uuid, created_at, updated_at, RLS (Cap. 5.2).

create extension if not exists pgcrypto;

-- Función compartida: mantener updated_at (Cap. 5.10).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: proyección pública del usuario, sincronizada con auth.users.
-- Se conserva id propio y auth_user_id (Cap. 5.7).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_url text,
  language text not null default 'es',
  timezone text not null default 'America/Bogota',
  currency text not null default 'COP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_auth_user_id_idx on public.profiles (auth_user_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper reutilizado por todas las policies: id de perfil del usuario autenticado.
-- SECURITY DEFINER evita recursión de RLS (Cap. 5.12).
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid();
$$;

-- Crea el profile automáticamente al registrarse un usuario (Cap. 9.4).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: cada quien solo su propio perfil (Cap. 5.13).
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth_user_id = auth.uid());

create policy profiles_update_own on public.profiles
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
