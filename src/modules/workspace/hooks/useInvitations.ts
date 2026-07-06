import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services/WorkspaceService';
import type { InviteMemberInput } from '../schemas/workspace.schema';

export const invitationsKey = (workspaceId: string) =>
  ['workspace-invitations', workspaceId] as const;

export function useInvitations(workspaceId: string) {
  return useQuery({
    queryKey: invitationsKey(workspaceId),
    queryFn: () => workspaceService.listInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => workspaceService.invite(workspaceId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitationsKey(workspaceId) }),
  });
}

export function useCancelInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceService.cancelInvitation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitationsKey(workspaceId) }),
  });
}
