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
