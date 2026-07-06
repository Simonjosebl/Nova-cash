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
