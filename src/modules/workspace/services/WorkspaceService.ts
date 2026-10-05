import { AppError } from '@/shared/types/app-error';
import {
  workspaceRepository,
  type IWorkspaceRepository,
} from '../repositories/WorkspaceRepository';
import { COLLABORATOR_ROLE, MAX_MEMBERS } from '../constants/workspace.constants';
import type {
  CreateWorkspaceDTO,
  InviteInput,
  UpdateWorkspaceDTO,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceWithRole,
} from '../types/workspace.types';

/**
 * WorkspaceService — lógica de negocio del núcleo (ADR-009 / ADR-019).
 * Reglas: RB-003 (máx colaboradores), RB-004 (solo admin invita — reforzado por RLS).
 */
export class WorkspaceService {
  constructor(private readonly repo: IWorkspaceRepository = workspaceRepository) {}

  listMine(): Promise<WorkspaceWithRole[]> {
    return this.repo.listMine();
  }

  create(dto: CreateWorkspaceDTO): Promise<Workspace> {
    // El servidor (RPC) deriva el owner de la sesión.
    return this.repo.create(dto);
  }

  update(id: string, dto: UpdateWorkspaceDTO): Promise<Workspace> {
    return this.repo.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.repo.listMembers(workspaceId);
  }

  listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return this.repo.listInvitations(workspaceId);
  }

  /**
   * Invita a un colaborador (siempre editor — R-11) validando límite (RB-003) y duplicados,
   * y le envía el correo con el enlace de la invitación.
   */
  async invite(workspaceId: string, input: InviteInput): Promise<WorkspaceInvitation> {
    const email = input.email.toLowerCase().trim();
    const [members, invitations] = await Promise.all([
      this.repo.listMembers(workspaceId),
      this.repo.listInvitations(workspaceId),
    ]);

    if (members.length + invitations.length >= MAX_MEMBERS) {
      throw new AppError('MEMBER_LIMIT', `Alcanzaste el máximo de colaboradores (${MAX_MEMBERS}).`);
    }
    if (members.some((m) => m.email.toLowerCase() === email)) {
      throw new AppError('ALREADY_MEMBER', 'Esa persona ya es colaboradora.');
    }
    if (invitations.some((i) => i.email.toLowerCase() === email)) {
      throw new AppError('ALREADY_INVITED', 'Ya existe una invitación pendiente para ese correo.');
    }

    const invitedBy = await this.repo.getMyProfileId();
    const invitation = await this.repo.createInvitation(
      workspaceId,
      { email, role: COLLABORATOR_ROLE },
      invitedBy,
    );
    await this.repo.sendInvitationEmail(invitation.id);
    return invitation;
  }

  /** Reenvía el correo de una invitación pendiente. */
  resendInvitation(invitationId: string): Promise<void> {
    return this.repo.sendInvitationEmail(invitationId);
  }

  removeMember(memberId: string): Promise<void> {
    return this.repo.removeMember(memberId);
  }

  cancelInvitation(id: string): Promise<void> {
    return this.repo.cancelInvitation(id);
  }

  /** Acepta una invitación por token (vía Edge Function) y devuelve el workspace unido. */
  acceptInvitation(token: string): Promise<string> {
    return this.repo.acceptInvitation(token);
  }

  getSettings(workspaceId: string): Promise<WorkspaceSettings | null> {
    return this.repo.getSettings(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
