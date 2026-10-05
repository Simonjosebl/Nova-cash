export type WorkspaceType = 'personal' | 'couple' | 'family' | 'trip' | 'project';
export type MemberRole = 'admin' | 'editor' | 'viewer';
export type MemberStatus = 'active' | 'removed';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  color: string | null;
  type: WorkspaceType;
  currency: string;
  timezone: string;
  ownerId: string;
  createdAt: string;
}

/** Workspace + rol del usuario actual (para el switcher y permisos de UI). */
export interface WorkspaceWithRole extends Workspace {
  role: MemberRole;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  profileId: string;
  role: MemberRole;
  status: MemberStatus;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  /** Solo visible para administradores (RLS); arma el enlace para compartir (R-11). */
  token: string;
}

export interface WorkspaceSettings {
  workspaceId: string;
  currency: string;
  language: string;
  firstDayOfWeek: number;
  notificationsEnabled: boolean;
  insightsEnabled: boolean;
}

/** DTOs de entrada (Cap. 8). */
export interface CreateWorkspaceDTO {
  name: string;
  emoji: string;
  type: WorkspaceType;
  currency: string;
}

export interface UpdateWorkspaceDTO {
  name?: string;
  emoji?: string;
  type?: WorkspaceType;
  currency?: string;
}

export interface InviteMemberDTO {
  email: string;
  role: MemberRole;
}

/** Lo que ingresa quien invita: solo el correo (el rol es siempre editor — R-11). */
export interface InviteInput {
  email: string;
}
