-- Nova Cash · Migración 002 · workspaces + members + invitations
-- Cap. 4.3–4.7 / 5.7 / 9. El Workspace es el núcleo del dominio (ADR-019).

-- Enums de dominio.
create type public.workspace_type as enum ('personal', 'couple', 'family', 'trip', 'project');
create type public.member_role as enum ('admin', 'editor', 'viewer');
create type public.member_status as enum ('active', 'removed');
create type public.invitation_status as enum ('pending', 'accepted', 'rejected', 'expired', 'cancelled');

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '👤',
  color text,
  type public.workspace_type not null default 'personal',
  currency text not null default 'COP',
  timezone text not null default 'America/Bogota',
  owner_id uuid not null references public.profiles (id) on delete restrict,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index workspaces_owner_id_idx on public.workspaces (owner_id);

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workspace_members (relación usuario ↔ workspace + rol)
-- ---------------------------------------------------------------------------
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'editor',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, profile_id)
);

create index workspace_members_workspace_id_idx on public.workspace_members (workspace_id);
create index workspace_members_profile_id_idx on public.workspace_members (profile_id);

create trigger workspace_members_set_updated_at
  before update on public.workspace_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workspace_invitations (token único, un solo uso — Cap. 4.7 / 9.9)
-- ---------------------------------------------------------------------------
create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role public.member_role not null default 'editor',
  status public.invitation_status not null default 'pending',
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references public.profiles (id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspace_invitations_workspace_id_idx on public.workspace_invitations (workspace_id);
create index workspace_invitations_email_idx on public.workspace_invitations (email);

create trigger workspace_invitations_set_updated_at
  before update on public.workspace_invitations
  for each row execute function public.set_updated_at();

-- Al crear un workspace, el owner se agrega como administrador (Cap. 4.5/4.6).
create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, profile_id, role, status)
  values (new.id, new.owner_id, 'admin', 'active');
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- Helpers de autorización (SECURITY DEFINER → sin recursión de RLS, Cap. 5.12/9.7).
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = ws
      and m.profile_id = public.current_profile_id()
      and m.status = 'active'
  );
$$;

create or replace function public.is_workspace_admin(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = ws
      and m.profile_id = public.current_profile_id()
      and m.status = 'active'
      and m.role = 'admin'
  );
$$;
