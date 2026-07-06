import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services/WorkspaceService';
import type { MemberRole } from '../types/workspace.types';

export const membersKey = (workspaceId: string) => ['workspace-members', workspaceId] as const;

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: membersKey(workspaceId),
    queryFn: () => workspaceService.listMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MemberRole }) =>
      workspaceService.changeMemberRole(memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) }),
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => workspaceService.removeMember(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) }),
  });
}
