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
