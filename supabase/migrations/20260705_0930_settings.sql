-- Nova Cash · Migración 004 · settings por workspace
-- Cap. 4.21 / 5.7. Configuración independiente por Workspace.

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  currency text not null default 'COP',
  language text not null default 'es',
  first_day_of_week smallint not null default 1, -- 1 = lunes
  notifications_enabled boolean not null default true,
  insights_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index settings_workspace_id_idx on public.settings (workspace_id);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- Crea la fila de settings al crear el workspace.
create or replace function public.handle_new_workspace_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (workspace_id, currency)
  values (new.id, new.currency);
  return new;
end;
$$;

create trigger on_workspace_created_settings
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace_settings();

alter table public.settings enable row level security;

create policy settings_select_members on public.settings
  for select using (public.is_workspace_member(workspace_id));

create policy settings_update_admin on public.settings
  for update using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));
