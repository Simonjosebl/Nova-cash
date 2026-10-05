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
