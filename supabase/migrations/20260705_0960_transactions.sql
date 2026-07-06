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
