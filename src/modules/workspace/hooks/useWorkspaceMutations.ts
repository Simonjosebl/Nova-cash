import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { workspaceService } from '../services/WorkspaceService';
import { useWorkspaceStore } from '../store/workspace.store';
import { workspacesKey } from './useWorkspaces';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace.schema';

/** Crea un Workspace, lo marca activo y va al inicio (Cap. 6.5). */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setActive = useWorkspaceStore((s) => s.setActive);

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspaceService.create(input),
    onSuccess: async (workspace) => {
      setActive(workspace.id);
      await queryClient.invalidateQueries({ queryKey: workspacesKey });
      navigate(ROUTES.home, { replace: true });
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) => workspaceService.update(workspaceId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspacesKey }),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const clear = useWorkspaceStore((s) => s.clear);
  return useMutation({
    mutationFn: (id: string) => workspaceService.remove(id),
    onSuccess: async () => {
      clear();
      await queryClient.invalidateQueries({ queryKey: workspacesKey });
    },
  });
}
