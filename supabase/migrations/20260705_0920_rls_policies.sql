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
