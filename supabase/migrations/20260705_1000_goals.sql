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
