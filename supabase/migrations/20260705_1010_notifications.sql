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
