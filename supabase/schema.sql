-- Nova Cash · Esquema consolidado (GENERADO — no editar a mano).
-- Es la concatenación, en orden, de supabase/migrations/*.sql. Para regenerarlo: npm run db:schema
-- Úsalo solo para crear un proyecto nuevo desde cero en el SQL Editor; para uno existente aplica
-- únicamente las migraciones que falten.

-- =====================================================================
-- 20260705_0900_profiles.sql
-- =====================================================================
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

-- =====================================================================
-- 20260705_0910_workspaces.sql
-- =====================================================================
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

-- =====================================================================
-- 20260705_0920_rls_policies.sql
-- =====================================================================
-- Nova Cash · Migración 003 · RLS de workspaces, members e invitations
-- Cap. 5.12 / 9.7. Todo acceso parte de la membresía (ADR-034/035).

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;

-- ---- workspaces ----
create policy workspaces_select_members on public.workspaces
  for select using (public.is_workspace_member(id) and deleted_at is null);

create policy workspaces_insert_owner on public.workspaces
  for insert with check (owner_id = public.current_profile_id());

-- Editar y soft-delete (deleted_at) solo administradores.
create policy workspaces_update_admin on public.workspaces
  for update using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));

-- ---- workspace_members ----
create policy members_select_members on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));

create policy members_insert_admin on public.workspace_members
  for insert with check (public.is_workspace_admin(workspace_id));

create policy members_update_admin on public.workspace_members
  for update using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy members_delete_admin on public.workspace_members
  for delete using (public.is_workspace_admin(workspace_id));

-- ---- workspace_invitations ----
-- El admin gestiona; el invitado puede ver la invitación dirigida a su correo.
create policy invitations_select on public.workspace_invitations
  for select using (
    public.is_workspace_admin(workspace_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy invitations_insert_admin on public.workspace_invitations
  for insert with check (public.is_workspace_admin(workspace_id));

create policy invitations_update on public.workspace_invitations
  for update using (
    public.is_workspace_admin(workspace_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy invitations_delete_admin on public.workspace_invitations
  for delete using (public.is_workspace_admin(workspace_id));

-- =====================================================================
-- 20260705_0930_settings.sql
-- =====================================================================
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

-- =====================================================================
-- 20260705_0940_accounts.sql
-- =====================================================================
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

-- =====================================================================
-- 20260705_0950_categories.sql
-- =====================================================================
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

-- =====================================================================
-- 20260705_0960_transactions.sql
-- =====================================================================
-- Nova Cash · Migración 007 · transactions + cascada de saldos
-- Cap. 4.10 / 4.11 / 5.7 / 5.10. La entidad principal (ADR-059). "La fase más importante".

create type public.transaction_type as enum ('income', 'expense', 'transfer', 'adjustment');
create type public.transaction_status as enum ('pending', 'confirmed', 'cancelled');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  to_account_id uuid references public.accounts (id) on delete restrict, -- solo transferencias
  category_id uuid references public.categories (id) on delete set null, -- null en transferencias (RB-015)
  created_by uuid references public.profiles (id),
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0), -- monto > 0 (Cap. 6.10)
  description text,
  transaction_date date not null default current_date,
  status public.transaction_status not null default 'confirmed',
  notes text,
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- Integridad: transferencia exige destino distinto; no-transferencia no lleva destino.
  constraint transfer_requires_target check (
    (type = 'transfer' and to_account_id is not null and to_account_id <> account_id)
    or (type <> 'transfer' and to_account_id is null)
  )
);

create index transactions_workspace_id_idx on public.transactions (workspace_id);
create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_date_idx on public.transactions (workspace_id, transaction_date desc);
create index transactions_type_idx on public.transactions (workspace_id, type);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Cascada de saldos (Cap. 5.10): mantiene accounts.current_balance en sincronía.
-- Reversa el efecto anterior y aplica el nuevo, cubriendo insert/update/delete y soft-delete.
create or replace function public.apply_transaction_to_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_active boolean := false;
  new_active boolean := false;
begin
  if (tg_op = 'UPDATE' or tg_op = 'DELETE') then
    old_active := old.deleted_at is null and old.status = 'confirmed';
  end if;
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    new_active := new.deleted_at is null and new.status = 'confirmed';
  end if;

  if old_active then
    if old.type in ('income', 'adjustment') then
      update public.accounts set current_balance = current_balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set current_balance = current_balance + old.amount where id = old.account_id;
    elsif old.type = 'transfer' then
      update public.accounts set current_balance = current_balance + old.amount where id = old.account_id;
      update public.accounts set current_balance = current_balance - old.amount where id = old.to_account_id;
    end if;
  end if;

  if new_active then
    if new.type in ('income', 'adjustment') then
      update public.accounts set current_balance = current_balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set current_balance = current_balance - new.amount where id = new.account_id;
    elsif new.type = 'transfer' then
      update public.accounts set current_balance = current_balance - new.amount where id = new.account_id;
      update public.accounts set current_balance = current_balance + new.amount where id = new.to_account_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger transactions_balance
  after insert or update or delete on public.transactions
  for each row execute function public.apply_transaction_to_balance();

alter table public.transactions enable row level security;

create policy transactions_select_members on public.transactions
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);

create policy transactions_insert_editor on public.transactions
  for insert with check (public.is_workspace_editor(workspace_id));

create policy transactions_update_editor on public.transactions
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

-- =====================================================================
-- 20260705_0970_audit_logs.sql
-- =====================================================================
-- Nova Cash · Migración 008 · audit_logs
-- Cap. 4.19 / 5.11 / 9.16. Auditoría inmutable (ADR-021/037). Registra toda acción importante.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid references public.profiles (id),
  action text not null, -- INSERT | UPDATE | DELETE | ...
  entity text not null, -- 'transaction', 'account', ...
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_id_idx on public.audit_logs (workspace_id);
create index audit_logs_entity_idx on public.audit_logs (workspace_id, entity, entity_id);

-- Registra auditoría de transacciones (Cap. 5.11). SECURITY DEFINER para escribir siempre.
create or replace function public.audit_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws uuid;
  ent uuid;
begin
  if tg_op = 'DELETE' then
    ws := old.workspace_id;
    ent := old.id;
  else
    ws := new.workspace_id;
    ent := new.id;
  end if;

  insert into public.audit_logs (workspace_id, user_id, action, entity, entity_id, before_data, after_data)
  values (
    ws,
    public.current_profile_id(),
    tg_op,
    'transaction',
    ent,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger transactions_audit
  after insert or update or delete on public.transactions
  for each row execute function public.audit_transaction();

alter table public.audit_logs enable row level security;

-- Solo administradores consultan la auditoría (Cap. 5.13). Sin políticas de UPDATE/DELETE ⇒ inmutable.
create policy audit_logs_select_admin on public.audit_logs
  for select using (public.is_workspace_admin(workspace_id));

-- =====================================================================
-- 20260705_0980_calendar.sql
-- =====================================================================
-- Nova Cash · Migración 009 · calendar_events + recurring_transactions
-- Cap. 4.12 / 4.13 / 5.7. Calendario financiero: eventos programados y gastos fijos.

create type public.event_status as enum ('pending', 'paid', 'cancelled');
create type public.recurrence_frequency as enum ('daily', 'weekly', 'biweekly', 'monthly', 'yearly');

-- ---------------------------------------------------------------------------
-- recurring_transactions: plantillas de gastos/ingresos fijos (Cap. 4.12).
-- ---------------------------------------------------------------------------
create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  emoji text not null default '🔁',
  flow public.category_type not null default 'expense',
  amount numeric(14, 2) not null check (amount > 0),
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  frequency public.recurrence_frequency not null default 'monthly',
  interval integer not null default 1,
  next_execution date,
  last_execution date,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index recurring_workspace_id_idx on public.recurring_transactions (workspace_id);

create trigger recurring_set_updated_at
  before update on public.recurring_transactions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- calendar_events: eventos financieros programados (Cap. 4.13).
-- Al registrarse el pago se enlaza con la transacción creada.
-- ---------------------------------------------------------------------------
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  recurring_id uuid references public.recurring_transactions (id) on delete set null,
  transaction_id uuid references public.transactions (id) on delete set null,
  title text not null,
  emoji text not null default '📅',
  flow public.category_type not null default 'expense',
  amount numeric(14, 2) not null default 0,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  event_date date not null,
  status public.event_status not null default 'pending',
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index calendar_events_workspace_date_idx on public.calendar_events (workspace_id, event_date);
create index calendar_events_status_idx on public.calendar_events (workspace_id, status);

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- RLS (Cap. 5.12 / 9.7): miembro lee; editor/admin escriben.
alter table public.recurring_transactions enable row level security;
alter table public.calendar_events enable row level security;

create policy recurring_select_members on public.recurring_transactions
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);
create policy recurring_insert_editor on public.recurring_transactions
  for insert with check (public.is_workspace_editor(workspace_id));
create policy recurring_update_editor on public.recurring_transactions
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

create policy calendar_select_members on public.calendar_events
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);
create policy calendar_insert_editor on public.calendar_events
  for insert with check (public.is_workspace_editor(workspace_id));
create policy calendar_update_editor on public.calendar_events
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

-- =====================================================================
-- 20260705_0990_budgets.sql
-- =====================================================================
-- Nova Cash · Migración 010 · budgets
-- Cap. 4.14 / 5.7 / 6.12. Un presupuesto por categoría (RB-009: nunca modifica transacciones).

create type public.budget_period as enum ('weekly', 'monthly', 'yearly');

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  period public.budget_period not null default 'monthly',
  warning_percentage integer not null default 80 check (warning_percentage between 1 and 100),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (workspace_id, category_id)
);

create index budgets_workspace_id_idx on public.budgets (workspace_id);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

alter table public.budgets enable row level security;

create policy budgets_select_members on public.budgets
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);

create policy budgets_insert_editor on public.budgets
  for insert with check (public.is_workspace_editor(workspace_id));

create policy budgets_update_editor on public.budgets
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

-- =====================================================================
-- 20260705_1000_goals.sql
-- =====================================================================
-- Nova Cash · Migración 011 · goals + goal_contributions
-- Cap. 4.15 / 5.7 / 6.13. Metas de ahorro. RB-008: reciben aportes; el saldo nunca es negativo.

create type public.goal_status as enum ('active', 'completed', 'cancelled');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  emoji text not null default '🎯',
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0,
  target_date date,
  status public.goal_status not null default 'active',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index goals_workspace_id_idx on public.goals (workspace_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- Cada aporte/retiro de una meta (Cap. 5.7). amount positivo = aporte, negativo = retiro.
create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  transaction_id uuid references public.transactions (id) on delete set null,
  amount numeric(14, 2) not null,
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index goal_contributions_goal_id_idx on public.goal_contributions (goal_id);

-- Mantiene goals.current_amount con la suma de aportes (Cap. 5.10).
create or replace function public.apply_goal_contribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.goals
  set current_amount = current_amount + new.amount
  where id = new.goal_id;
  return new;
end;
$$;

create trigger on_goal_contribution
  after insert on public.goal_contributions
  for each row execute function public.apply_goal_contribution();

alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

create policy goals_select_members on public.goals
  for select using (public.is_workspace_member(workspace_id) and deleted_at is null);
create policy goals_insert_editor on public.goals
  for insert with check (public.is_workspace_editor(workspace_id));
create policy goals_update_editor on public.goals
  for update using (public.is_workspace_editor(workspace_id))
  with check (public.is_workspace_editor(workspace_id));

create policy goal_contributions_select_members on public.goal_contributions
  for select using (public.is_workspace_member(workspace_id));
create policy goal_contributions_insert_editor on public.goal_contributions
  for insert with check (public.is_workspace_editor(workspace_id));

-- =====================================================================
-- 20260705_1010_notifications.sql
-- =====================================================================
-- Nova Cash · Migración 012 · notifications
-- Cap. 4.20 / 5.7 / 6.19. Locales + push. Generadas por el sistema (triggers / Edge Functions).

create type public.notification_priority as enum ('critical', 'warning', 'info', 'success');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade, -- null = para todo el workspace
  title text not null,
  message text not null,
  priority public.notification_priority not null default 'info',
  type text not null default 'general',
  read boolean not null default false,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_workspace_idx on public.notifications (workspace_id, created_at desc);
create index notifications_profile_idx on public.notifications (profile_id);

alter table public.notifications enable row level security;

-- Un miembro ve las del workspace dirigidas a todos o a sí mismo.
create policy notifications_select on public.notifications
  for select using (
    public.is_workspace_member(workspace_id)
    and (profile_id is null or profile_id = public.current_profile_id())
  );

-- Marcar como leída (update) por el destinatario.
create policy notifications_update on public.notifications
  for update using (
    public.is_workspace_member(workspace_id)
    and (profile_id is null or profile_id = public.current_profile_id())
  );

create policy notifications_insert_editor on public.notifications
  for insert with check (public.is_workspace_editor(workspace_id));

-- Ejemplo de generación server-side (Cap. 5.10): al completar una meta, notificar.
create or replace function public.notify_goal_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    insert into public.notifications (workspace_id, title, message, priority, type)
    values (
      new.workspace_id,
      '¡Meta completada! 🎉',
      new.emoji || ' ' || new.name || ' alcanzó su objetivo.',
      'success',
      'goal'
    );
  end if;
  return new;
end;
$$;

create trigger on_goal_completed
  after update on public.goals
  for each row execute function public.notify_goal_completed();

-- =====================================================================
-- 20261003_1000_budgets_currency.sql
-- =====================================================================
-- Nova Cash · Migración 013 · budgets.currency
-- Resolución R-08. Cada presupuesto tiene su propia moneda (por defecto, la del espacio).
-- Su avance solo suma gastos de cuentas en esa misma moneda: no hay conversión automática.

alter table public.budgets add column currency text;

update public.budgets b
set currency = w.currency
from public.workspaces w
where w.id = b.workspace_id;

alter table public.budgets alter column currency set not null;

alter table public.budgets
  add constraint budgets_currency_iso check (currency ~ '^[A-Z]{3}$');

-- =====================================================================
-- 20261003_1010_soft_delete_rpc.sql
-- =====================================================================
-- Nova Cash · Migración 014 · soft delete vía RPC
-- Resolución R-09. Las políticas SELECT filtran `deleted_at is null`; por eso un UPDATE que
-- marca deleted_at deja la fila invisible para quien la edita y Postgres lo rechaza por RLS.
-- Estas funciones SECURITY DEFINER validan permisos en el servidor y hacen el soft delete.

-- Registros de un espacio (requiere rol editor o admin en ese espacio).
create or replace function public.soft_delete_record(p_table text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace uuid;
begin
  if p_table not in ('accounts', 'categories', 'transactions', 'calendar_events', 'budgets', 'goals') then
    raise exception 'Tabla no permitida: %', p_table using errcode = '42501';
  end if;

  execute format('select workspace_id from public.%I where id = $1 and deleted_at is null', p_table)
    into v_workspace
    using p_id;

  if v_workspace is null then
    raise exception 'El registro no existe o ya fue eliminado.' using errcode = 'P0002';
  end if;

  if not public.is_workspace_editor(v_workspace) then
    raise exception 'No tienes permisos para eliminar en este espacio.' using errcode = '42501';
  end if;

  -- Una cuenta eliminada se lleva sus movimientos (y los traslados que la involucran):
  -- deja de aparecer en saldos y reportes. El trigger de saldos revierte cada efecto.
  if p_table = 'accounts' then
    update public.transactions
    set deleted_at = now()
    where deleted_at is null and (account_id = p_id or to_account_id = p_id);
  end if;

  execute format('update public.%I set deleted_at = now() where id = $1', p_table) using p_id;
end;
$$;

-- Espacio completo (solo administradores).
create or replace function public.soft_delete_workspace(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_workspace_admin(p_id) then
    raise exception 'Solo un administrador puede eliminar el espacio.' using errcode = '42501';
  end if;

  update public.workspaces set deleted_at = now() where id = p_id and deleted_at is null;
end;
$$;

revoke all on function public.soft_delete_record(text, uuid) from public, anon;
revoke all on function public.soft_delete_workspace(uuid) from public, anon;
grant execute on function public.soft_delete_record(text, uuid) to authenticated;
grant execute on function public.soft_delete_workspace(uuid) to authenticated;

-- =====================================================================
-- 20261003_1020_reminders.sql
-- =====================================================================
-- Nova Cash · Migración 015 · reminders
-- Resolución R-13. Recordatorios configurables para registrar gastos e ingresos (Cap. 4.20).
-- Un job de pg_cron crea la notificación a la hora local del usuario (zona de su perfil).

create type public.reminder_kind as enum ('expense', 'income', 'any');

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind public.reminder_kind not null default 'any',
  time_of_day time not null,
  -- Días ISO: 1 = lunes … 7 = domingo.
  days smallint[] not null check (cardinality(days) between 1 and 7 and days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  enabled boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminders_profile_idx on public.reminders (profile_id);
create index reminders_enabled_idx on public.reminders (enabled) where enabled;

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

alter table public.reminders enable row level security;

-- Cada usuario gestiona solo sus recordatorios, en espacios de los que es miembro.
create policy reminders_select_own on public.reminders
  for select using (profile_id = public.current_profile_id());

create policy reminders_insert_own on public.reminders
  for insert with check (
    profile_id = public.current_profile_id() and public.is_workspace_member(workspace_id)
  );

create policy reminders_update_own on public.reminders
  for update using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id() and public.is_workspace_member(workspace_id));

create policy reminders_delete_own on public.reminders
  for delete using (profile_id = public.current_profile_id());

-- Crea las notificaciones de los recordatorios que ya llegaron a su hora hoy (hora local)
-- y aún no se enviaron hoy. Tolera retrasos del job: si se atrasa, envía al siguiente ciclo.
create or replace function public.dispatch_due_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with due as (
    select r.id, r.workspace_id, r.profile_id, r.kind
    from public.reminders r
    join public.profiles p on p.id = r.profile_id
    join public.workspaces w on w.id = r.workspace_id and w.deleted_at is null
    cross join lateral (select now() at time zone coalesce(p.timezone, 'America/Bogota') as local_now) t
    where r.enabled
      and extract(isodow from t.local_now)::smallint = any (r.days)
      and t.local_now::time >= r.time_of_day
      and (
        r.last_sent_at is null
        or (r.last_sent_at at time zone coalesce(p.timezone, 'America/Bogota'))::date < t.local_now::date
      )
  ),
  sent as (
    insert into public.notifications (workspace_id, profile_id, title, message, priority, type)
    select
      d.workspace_id,
      d.profile_id,
      case d.kind
        when 'expense' then '¿Registraste tus gastos de hoy? 💸'
        when 'income' then '¿Recibiste ingresos hoy? 💰'
        else '¿Ya registraste tus movimientos? ✍️'
      end,
      case d.kind
        when 'expense' then 'Anota lo que gastaste para mantener tu presupuesto al día.'
        when 'income' then 'Registra tus ingresos para ver tu saldo real.'
        else 'Toma un minuto para registrar tus gastos e ingresos de hoy.'
      end,
      'info',
      'reminder'
    from due d
    returning 1
  )
  update public.reminders r
  set last_sent_at = now()
  from due
  where r.id = due.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.dispatch_due_reminders() from public, anon, authenticated;

-- Job cada 5 minutos (requiere la extensión pg_cron: Database → Extensions).
create extension if not exists pg_cron;
select cron.schedule('nova-dispatch-reminders', '*/5 * * * *', 'select public.dispatch_due_reminders()');

-- =====================================================================
-- 20261005_1000_security_hardening.sql
-- =====================================================================
-- Nova Cash · Migración 016 · endurecimiento de seguridad previo al lanzamiento (R-18)
-- Corrige los hallazgos de la auditoría: escalada de privilegios por invitaciones,
-- referencias entre espacios, columnas derivadas editables, notificaciones editables,
-- espacios eliminados aún accesibles, abuso de invitaciones y RPC create_workspace sin versionar.

-- ---------------------------------------------------------------------------
-- 1. Helpers de permisos: un espacio eliminado deja de ser accesible
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.workspace_members m
    join public.workspaces w on w.id = m.workspace_id and w.deleted_at is null
    where m.workspace_id = ws
      and m.profile_id = public.current_profile_id()
      and m.status = 'active'
  );
$$;

create or replace function public.is_workspace_editor(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.workspace_members m
    join public.workspaces w on w.id = m.workspace_id and w.deleted_at is null
    where m.workspace_id = ws
      and m.profile_id = public.current_profile_id()
      and m.status = 'active'
      and m.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_workspace_admin(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.workspace_members m
    join public.workspaces w on w.id = m.workspace_id and w.deleted_at is null
    where m.workspace_id = ws
      and m.profile_id = public.current_profile_id()
      and m.status = 'active'
      and m.role = 'admin'
  );
$$;

-- ¿El usuario autenticado confirmó su correo? (base para todo lo que depende del email)
create or replace function public.current_email_confirmed()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select u.email_confirmed_at is not null from auth.users u where u.id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- 2. Invitaciones: solo el admin las modifica; el invitado no puede reescribirlas
--    (antes podía cambiar role/workspace_id y volverse admin de otro espacio)
-- ---------------------------------------------------------------------------
drop policy if exists invitations_update on public.workspace_invitations;
drop policy if exists invitations_update_admin on public.workspace_invitations;
create policy invitations_update_admin on public.workspace_invitations
  for update using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists invitations_select on public.workspace_invitations;
create policy invitations_select on public.workspace_invitations
  for select using (
    public.is_workspace_admin(workspace_id)
    or (
      public.current_email_confirmed()
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Anti-abuso de correos: control de reenvíos y tope diario por espacio.
alter table public.workspace_invitations
  add column if not exists send_count integer not null default 0,
  add column if not exists last_sent_at timestamptz;

create or replace function public.limit_invitations()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (
    select count(*) from public.workspace_invitations i
    where i.workspace_id = new.workspace_id and i.created_at > now() - interval '24 hours'
  ) >= 20 then
    raise exception 'Alcanzaste el máximo de invitaciones por hoy. Intenta mañana.'
      using errcode = 'P0001', hint = 'INVITE_RATE_LIMITED';
  end if;
  new.role := 'editor'; -- R-11: todo colaborador invitado es editor
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists before_invitation_insert on public.workspace_invitations;
create trigger before_invitation_insert
  before insert on public.workspace_invitations
  for each row execute function public.limit_invitations();

-- Aceptación atómica (reemplaza la lógica de la Edge Function con service role):
-- correo confirmado y coincidente, invitación vigente, espacio activo, rol editor y sin
-- degradar a quien ya es miembro activo. Un solo uso.
create or replace function public.accept_invitation(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_profile uuid := public.current_profile_id();
  v_email text;
  v_confirmed boolean;
  v_workspace uuid;
  v_status public.invitation_status;
  v_expires timestamptz;
  v_inv_email text;
begin
  select lower(u.email), u.email_confirmed_at is not null into v_email, v_confirmed
  from auth.users u where u.id = auth.uid();

  if v_profile is null or v_email is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501', hint = 'UNAUTHENTICATED';
  end if;
  if not v_confirmed then
    raise exception 'Confirma tu correo antes de aceptar la invitación.'
      using errcode = '42501', hint = 'EMAIL_NOT_CONFIRMED';
  end if;

  update public.workspace_invitations i
  set status = 'accepted', accepted_at = now()
  where i.token = p_token
    and i.status = 'pending'
    and i.expires_at > now()
    and lower(i.email) = v_email
    and exists (select 1 from public.workspaces w where w.id = i.workspace_id and w.deleted_at is null)
  returning i.workspace_id into v_workspace;

  if v_workspace is null then
    select i.status, i.expires_at, lower(i.email) into v_status, v_expires, v_inv_email
    from public.workspace_invitations i where i.token = p_token;

    if v_status = 'pending' and v_expires <= now() then
      update public.workspace_invitations set status = 'expired' where token = p_token;
      raise exception 'La invitación expiró. Pide una nueva.' using errcode = 'P0001', hint = 'INVITATION_EXPIRED';
    elsif v_status = 'pending' and v_inv_email <> v_email then
      raise exception 'Esta invitación es para otro correo. Ingresa con el correo invitado.'
        using errcode = '42501', hint = 'EMAIL_MISMATCH';
    end if;
    raise exception 'La invitación no es válida o ya fue usada.' using errcode = 'P0001', hint = 'INVITATION_INVALID';
  end if;

  insert into public.workspace_members (workspace_id, profile_id, role, status)
  values (v_workspace, v_profile, 'editor', 'active')
  on conflict (workspace_id, profile_id) do update
    set role = case when public.workspace_members.status = 'active'
                     then public.workspace_members.role else 'editor' end,
        status = 'active';

  return v_workspace;
end;
$$;

revoke all on function public.accept_invitation(uuid) from public, anon;
grant execute on function public.accept_invitation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Integridad entre espacios: las referencias deben ser del mismo espacio
--    (antes un usuario podía mover saldos o metas de otro espacio)
-- ---------------------------------------------------------------------------
create or replace function public.assert_same_workspace(p_table text, p_id uuid, p_workspace uuid)
returns void language plpgsql stable security definer set search_path = public as $$
declare
  v_ws uuid;
begin
  if p_id is null then return; end if;
  if p_table not in ('accounts', 'categories', 'goals', 'transactions') then
    raise exception 'Tabla no permitida' using errcode = '42501';
  end if;
  execute format('select workspace_id from public.%I where id = $1', p_table) into v_ws using p_id;
  if v_ws is distinct from p_workspace then
    raise exception 'Referencia inválida: pertenece a otro espacio.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.enforce_same_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'transactions' then
    perform public.assert_same_workspace('accounts', new.account_id, new.workspace_id);
    perform public.assert_same_workspace('accounts', new.to_account_id, new.workspace_id);
    perform public.assert_same_workspace('categories', new.category_id, new.workspace_id);
  elsif tg_table_name in ('calendar_events', 'recurring_transactions') then
    perform public.assert_same_workspace('accounts', new.account_id, new.workspace_id);
    perform public.assert_same_workspace('categories', new.category_id, new.workspace_id);
    if tg_table_name = 'calendar_events' then
      perform public.assert_same_workspace('transactions', new.transaction_id, new.workspace_id);
    end if;
  elsif tg_table_name = 'budgets' then
    perform public.assert_same_workspace('categories', new.category_id, new.workspace_id);
  elsif tg_table_name = 'goal_contributions' then
    perform public.assert_same_workspace('goals', new.goal_id, new.workspace_id);
    perform public.assert_same_workspace('transactions', new.transaction_id, new.workspace_id);
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['transactions', 'calendar_events', 'recurring_transactions', 'budgets', 'goal_contributions']
  loop
    execute format('drop trigger if exists enforce_same_workspace on public.%I', t);
    execute format(
      'create trigger enforce_same_workspace before insert or update on public.%I
         for each row execute function public.enforce_same_workspace()', t);
  end loop;
end;
$$;

-- El cambio de espacio de un registro no está permitido (evita mover datos entre espacios).
create or replace function public.prevent_workspace_change()
returns trigger language plpgsql as $$
begin
  if new.workspace_id is distinct from old.workspace_id then
    raise exception 'No se puede cambiar el espacio de un registro.' using errcode = '42501';
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['accounts', 'categories', 'transactions', 'calendar_events', 'recurring_transactions',
                           'budgets', 'goals', 'goal_contributions', 'notifications', 'reminders',
                           'workspace_invitations', 'workspace_members']
  loop
    execute format('drop trigger if exists prevent_workspace_change on public.%I', t);
    execute format(
      'create trigger prevent_workspace_change before update on public.%I
         for each row execute function public.prevent_workspace_change()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Columnas derivadas y sensibles: no editables desde el cliente
-- ---------------------------------------------------------------------------
-- Saldos de cuentas: solo los mueve el trigger de movimientos.
revoke insert, update on public.accounts from authenticated;
grant insert (workspace_id, name, emoji, type, currency, color, position, created_by) on public.accounts to authenticated;
grant update (name, emoji, type, color, position) on public.accounts to authenticated;

-- Avance de metas: solo lo mueven los aportes.
revoke insert, update on public.goals from authenticated;
grant insert (workspace_id, name, emoji, target_amount, target_date, created_by) on public.goals to authenticated;
grant update (name, emoji, target_amount, target_date, status) on public.goals to authenticated;

-- Notificaciones: el destinatario solo puede marcarlas como leídas.
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

-- Perfil: el correo lo gestiona Supabase Auth (no editable a mano).
revoke update on public.profiles from authenticated;
grant update (name, avatar_url, language, timezone, currency) on public.profiles to authenticated;

-- Los compañeros de un espacio pueden ver nombre/correo/foto entre sí (lista de miembros).
drop policy if exists profiles_select_comembers on public.profiles;
create policy profiles_select_comembers on public.profiles
  for select using (
    exists (
      select 1
      from public.workspace_members mine
      join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.profile_id = public.current_profile_id()
        and mine.status = 'active'
        and theirs.profile_id = profiles.id
        and theirs.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Propietario protegido: no se transfiere ni se degrada/elimina por la API
-- ---------------------------------------------------------------------------
create or replace function public.protect_workspace_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'workspaces' then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'El propietario del espacio no se puede cambiar.' using errcode = '42501';
    end if;
    return new;
  end if;

  -- workspace_members
  if exists (
    select 1 from public.workspaces w where w.id = old.workspace_id and w.owner_id = old.profile_id
  ) and (tg_op = 'DELETE' or new.role <> 'admin' or new.status <> 'active') then
    raise exception 'El propietario no se puede quitar ni degradar.' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists protect_workspace_owner on public.workspaces;
create trigger protect_workspace_owner before update on public.workspaces
  for each row execute function public.protect_workspace_owner();

drop trigger if exists protect_workspace_owner on public.workspace_members;
create trigger protect_workspace_owner before update or delete on public.workspace_members
  for each row execute function public.protect_workspace_owner();

-- ---------------------------------------------------------------------------
-- 6. Límites de texto (evitan abuso en correos y UI). NOT VALID: no revisa filas viejas.
-- ---------------------------------------------------------------------------
alter table public.workspaces drop constraint if exists workspaces_name_length;
alter table public.workspaces add constraint workspaces_name_length
  check (char_length(name) between 1 and 60 and name !~ '[\r\n]') not valid;

alter table public.profiles drop constraint if exists profiles_name_length;
alter table public.profiles add constraint profiles_name_length
  check (char_length(name) <= 80 and name !~ '[\r\n]') not valid;

-- ---------------------------------------------------------------------------
-- 7. RPC create_workspace versionada (antes solo existía en la base alojada)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_workspace'
  loop
    execute format('drop function %s', r.sig);
  end loop;
end;
$$;

create function public.create_workspace(p_name text, p_emoji text, p_type text, p_currency text)
returns public.workspaces language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid := public.current_profile_id();
  v_workspace public.workspaces;
begin
  if v_owner is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501';
  end if;
  if p_currency !~ '^[A-Z]{3}$' then
    raise exception 'Moneda inválida.' using errcode = '22023';
  end if;

  insert into public.workspaces (name, emoji, type, currency, owner_id, created_by)
  values (trim(p_name), p_emoji, p_type::public.workspace_type, p_currency, v_owner, v_owner)
  returning * into v_workspace;

  return v_workspace;
end;
$$;

revoke all on function public.create_workspace(text, text, text, text) from public, anon;
grant execute on function public.create_workspace(text, text, text, text) to authenticated;

-- Funciones internas: no invocables como RPC.
revoke all on function public.assert_same_workspace(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.current_email_confirmed() from public, anon;
grant execute on function public.current_email_confirmed() to authenticated;

notify pgrst, 'reload schema';
