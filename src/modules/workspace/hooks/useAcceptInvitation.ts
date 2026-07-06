import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services/WorkspaceService';
import { useWorkspaceStore } from '../store/workspace.store';
import { workspacesKey } from './useWorkspaces';

/** Acepta una invitación por token y activa el Workspace unido (Cap. 6.16). */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const setActive = useWorkspaceStore((s) => s.setActive);

  return useMutation({
    mutationFn: (token: string) => workspaceService.acceptInvitation(token),
    onSuccess: async (workspaceId) => {
      setActive(workspaceId);
      await queryClient.invalidateQueries({ queryKey: workspacesKey });
    },
  });
}
