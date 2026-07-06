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
