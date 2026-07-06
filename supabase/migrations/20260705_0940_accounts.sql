-- Nova Cash · Migración 005 · accounts
-- Cap. 4.8 / 5.7. Dónde vive el dinero. Alimenta el saldo del Dashboard.

create type public.account_type as enum (
  'cash',
  'bank',
  'credit_card',
  'debit_card',
  'savings',
  'investment',
  'crypto'
);

-- Helper: miembro con permiso de escritura (admin o editor) — Cap. 4.6 / 9.8.
create or replace function public.is_workspace_editor(ws uuid)
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
      and m.role in ('admin', 'editor')
  );
$$;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  emoji text not null default '💵',
  type public.account_type not null default 'cash',
  currency text not null default 'COP',
  opening_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  color text,
  position integer not null default 0,
  is_archived boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index accounts_workspace_id_idx on public.accounts (workspace_id);
create index accounts_position_idx on public.accounts (workspace_id, position);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- Inicializa current_balance = opening_balance al crear (si no se especifica).
create or replace function public.handle_new_account()
returns trigger
language plpgsql
as $$
begin
  if new.current_balance = 0 and new.opening_balance <> 0 then
    new.current_balance := new.opening_balance;
  end if;
  return new;
end;
$$;

create trigger on_account_created
  before insert on public.accounts
  for each row execute function public.handle_new_account();

alter table public.accounts enable row level security;

create policy accounts_select_members on public.accounts
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);

create policy accounts_insert_editor on public.accounts
  for insert with check (public.is_workspace_editor(workspace_id));

create policy accounts_update_editor on public.accounts
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));
