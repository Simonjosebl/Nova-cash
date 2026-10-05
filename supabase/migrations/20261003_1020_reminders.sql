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
