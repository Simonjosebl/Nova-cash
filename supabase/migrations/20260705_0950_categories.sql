-- Nova Cash · Migración 006 · categories
-- Cap. 4.9 / 5.7. Pertenecen al Workspace (RB-005). Emojis como identidad (Cap. 3.13).
-- No existen categorías obligatorias (Cap. 4.9): no se auto-siembran.

create type public.category_type as enum ('income', 'expense');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  emoji text not null default '🏷️',
  name text not null,
  type public.category_type not null default 'expense',
  color text,
  position integer not null default 0,
  is_default boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index categories_workspace_id_idx on public.categories (workspace_id);
create index categories_type_position_idx on public.categories (workspace_id, type, position);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

create policy categories_select_members on public.categories
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);

create policy categories_insert_editor on public.categories
  for insert with check (public.is_workspace_editor(workspace_id));

create policy categories_update_editor on public.categories
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));
