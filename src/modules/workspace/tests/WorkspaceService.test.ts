import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceService } from '../services/WorkspaceService';
import type { IWorkspaceRepository } from '../repositories/WorkspaceRepository';
import type { WorkspaceInvitation, WorkspaceMember } from '../types/workspace.types';
import { isAppError } from '@/shared/types/app-error';

function member(email: string, id = email): WorkspaceMember {
  return {
    id,
    workspaceId: 'ws1',
    profileId: id,
    role: 'editor',
    status: 'active',
    name: email,
    email,
    avatarUrl: null,
  };
}

function createRepoMock(): IWorkspaceRepository {
  return {
    getMyProfileId: vi.fn().mockResolvedValue('p1'),
    listMine: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    listMembers: vi.fn().mockResolvedValue([]),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    listInvitations: vi.fn().mockResolvedValue([]),
    createInvitation: vi.fn(),
    cancelInvitation: vi.fn(),
    acceptInvitation: vi.fn().mockResolvedValue('ws1'),
    getSettings: vi.fn(),
  };
}

describe('WorkspaceService', () => {
  let repo: IWorkspaceRepository;
  let service: WorkspaceService;

  beforeEach(() => {
    repo = createRepoMock();
    service = new WorkspaceService(repo);
  });

  it('create obtiene el perfil y delega en el repositorio', async () => {
    await service.create({ name: 'Hogar', emoji: '🏠', type: 'family', currency: 'COP' });
    expect(repo.getMyProfileId).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Hogar' }), 'p1');
  });

  it('invite normaliza el correo y registra invitedBy', async () => {
    vi.mocked(repo.createInvitation).mockResolvedValue({} as WorkspaceInvitation);
    await service.invite('ws1', { email: '  Nuevo@Correo.COM ', role: 'editor' });
    expect(repo.createInvitation).toHaveBeenCalledWith(
      'ws1',
      { email: 'nuevo@correo.com', role: 'editor' },
      'p1',
    );
  });

  it('invite bloquea al superar el máximo de colaboradores (RB-003)', async () => {
    vi.mocked(repo.listMembers).mockResolvedValue([
      member('a@x.com'),
      member('b@x.com'),
      member('c@x.com'),
      member('d@x.com'),
      member('e@x.com'),
    ]);
    await expect(service.invite('ws1', { email: 'f@x.com', role: 'editor' })).rejects.toSatisfy(
      (e) => isAppError(e) && e.code === 'MEMBER_LIMIT',
    );
  });

  it('invite rechaza a un colaborador existente', async () => {
    vi.mocked(repo.listMembers).mockResolvedValue([member('ya@x.com')]);
    await expect(service.invite('ws1', { email: 'ya@x.com', role: 'editor' })).rejects.toSatisfy(
      (e) => isAppError(e) && e.code === 'ALREADY_MEMBER',
    );
  });

  it('invite rechaza correos con invitación pendiente', async () => {
    vi.mocked(repo.listInvitations).mockResolvedValue([
      {
        id: 'i1',
        workspaceId: 'ws1',
        email: 'pend@x.com',
        role: 'editor',
        status: 'pending',
        expiresAt: '',
        createdAt: '',
      },
    ]);
    await expect(service.invite('ws1', { email: 'pend@x.com', role: 'editor' })).rejects.toSatisfy(
      (e) => isAppError(e) && e.code === 'ALREADY_INVITED',
    );
  });
});
