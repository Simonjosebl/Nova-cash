import { supabase } from '@/lib/supabase';
import { AppError } from '@/shared/types/app-error';
import { toAppError } from '@/shared/types/db-error';
import type {
  CreateWorkspaceDTO,
  InviteMemberDTO,
  MemberRole,
  UpdateWorkspaceDTO,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceWithRole,
} from '../types/workspace.types';

const WS_COLS = 'id,name,emoji,color,type,currency,timezone,owner_id,created_at';

/** Filas crudas (snake_case) devueltas por Supabase. */
interface WorkspaceRow {
  id: string;
  name: string;
  emoji: string;
  color: string | null;
  type: Workspace['type'];
  currency: string;
  timezone: string;
  owner_id: string;
  created_at: string;
}
interface ProfileRef {
  name: string;
  email: string;
  avatar_url: string | null;
}
interface MemberRow {
  id: string;
  workspace_id: string;
  profile_id: string;
  role: MemberRole;
  status: 'active' | 'removed';
  profile: ProfileRef | ProfileRef[] | null;
}
interface InvitationRow {
  id: string;
  workspace_id: string;
  email: string;
  role: MemberRole;
  status: WorkspaceInvitation['status'];
  expires_at: string;
  created_at: string;
}
interface SettingsRow {
  workspace_id: string;
  currency: string;
  language: string;
  first_day_of_week: number;
  notifications_enabled: boolean;
  insights_enabled: boolean;
}

function mapWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    type: row.type,
    currency: row.currency,
    timezone: row.timezone,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

function mapMember(row: MemberRow): WorkspaceMember {
  const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    profileId: row.profile_id,
    role: row.role,
    status: row.status,
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export interface IWorkspaceRepository {
  getMyProfileId(): Promise<string>;
  listMine(): Promise<WorkspaceWithRole[]>;
  create(dto: CreateWorkspaceDTO, ownerProfileId: string): Promise<Workspace>;
  update(id: string, dto: UpdateWorkspaceDTO): Promise<Workspace>;
  softDelete(id: string): Promise<void>;
  listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  updateMemberRole(memberId: string, role: MemberRole): Promise<void>;
  removeMember(memberId: string): Promise<void>;
  listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]>;
  createInvitation(
    workspaceId: string,
    dto: InviteMemberDTO,
    invitedBy: string,
  ): Promise<WorkspaceInvitation>;
  cancelInvitation(id: string): Promise<void>;
  acceptInvitation(token: string): Promise<string>;
  getSettings(workspaceId: string): Promise<WorkspaceSettings | null>;
}

export class WorkspaceRepository implements IWorkspaceRepository {
  async getMyProfileId(): Promise<string> {
    const { data, error } = await supabase.from('profiles').select('id').single();
    if (error || !data) throw toAppError(error, 'No pudimos cargar tu perfil.');
    return (data as { id: string }).id;
  }

  async listMine(): Promise<WorkspaceWithRole[]> {
    const profileId = await this.getMyProfileId();
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`role, workspace:workspaces!inner(${WS_COLS})`)
      .eq('profile_id', profileId)
      .eq('status', 'active');
    if (error) throw toAppError(error, 'No pudimos cargar tus espacios.');

    const rows = (data ?? []) as unknown as Array<{
      role: MemberRole;
      workspace: WorkspaceRow | WorkspaceRow[] | null;
    }>;
    return rows
      .map((r) => ({
        role: r.role,
        workspace: Array.isArray(r.workspace) ? r.workspace[0] : r.workspace,
      }))
      .filter((r): r is { role: MemberRole; workspace: WorkspaceRow } => !!r.workspace)
      .map((r) => ({ ...mapWorkspace(r.workspace), role: r.role }));
  }

  async create(dto: CreateWorkspaceDTO, ownerProfileId: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: dto.name,
        emoji: dto.emoji,
        type: dto.type,
        currency: dto.currency,
        owner_id: ownerProfileId,
        created_by: ownerProfileId,
      })
      .select(WS_COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear el espacio.');
    return mapWorkspace(data as WorkspaceRow);
  }

  async update(id: string, dto: UpdateWorkspaceDTO): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .update(dto)
      .eq('id', id)
      .select(WS_COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar el espacio.');
    return mapWorkspace(data as WorkspaceRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspaces')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw toAppError(error, 'No pudimos eliminar el espacio.');
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('id,workspace_id,profile_id,role,status, profile:profiles(name,email,avatar_url)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');
    if (error) throw toAppError(error, 'No pudimos cargar los colaboradores.');
    return ((data ?? []) as MemberRow[]).map(mapMember);
  }

  async updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
    const { error } = await supabase.from('workspace_members').update({ role }).eq('id', memberId);
    if (error) throw toAppError(error, 'No pudimos cambiar el rol.');
  }

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .update({ status: 'removed' })
      .eq('id', memberId);
    if (error) throw toAppError(error, 'No pudimos eliminar al colaborador.');
  }

  async listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('id,workspace_id,email,role,status,expires_at,created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending');
    if (error) throw toAppError(error, 'No pudimos cargar las invitaciones.');
    return ((data ?? []) as InvitationRow[]).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }));
  }

  async createInvitation(
    workspaceId: string,
    dto: InviteMemberDTO,
    invitedBy: string,
  ): Promise<WorkspaceInvitation> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        email: dto.email.toLowerCase().trim(),
        role: dto.role,
        invited_by: invitedBy,
      })
      .select('id,workspace_id,email,role,status,expires_at,created_at')
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos enviar la invitación.');
    const row = data as InvitationRow;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  }

  async cancelInvitation(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_invitations')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) throw toAppError(error, 'No pudimos cancelar la invitación.');
  }

  async acceptInvitation(token: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('accept-invitation', {
      body: { token },
    });
    const result = data as { workspaceId?: string } | null;
    if (error || !result?.workspaceId) {
      throw new AppError('INVITATION_INVALID', 'La invitación no es válida o ya expiró.');
    }
    return result.workspaceId;
  }

  async getSettings(workspaceId: string): Promise<WorkspaceSettings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select(
        'workspace_id,currency,language,first_day_of_week,notifications_enabled,insights_enabled',
      )
      .eq('workspace_id', workspaceId)
      .maybeSingle();
    if (error) throw toAppError(error, 'No pudimos cargar la configuración.');
    if (!data) return null;
    const row = data as SettingsRow;
    return {
      workspaceId: row.workspace_id,
      currency: row.currency,
      language: row.language,
      firstDayOfWeek: row.first_day_of_week,
      notificationsEnabled: row.notifications_enabled,
      insightsEnabled: row.insights_enabled,
    };
  }
}

export const workspaceRepository = new WorkspaceRepository();

/** Reexport para uso puntual (guards que necesitan reaccionar a ausencia de perfil). */
export { AppError };
