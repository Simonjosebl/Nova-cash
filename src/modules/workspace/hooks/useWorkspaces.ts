import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '../services/WorkspaceService';
import { useWorkspaceStore } from '../store/workspace.store';
import type { WorkspaceWithRole } from '../types/workspace.types';

export const workspacesKey = ['workspaces'] as const;

/** Lista los Workspaces del usuario (los propios + a los que fue invitado). */
export function useWorkspaces() {
  return useQuery({
    queryKey: workspacesKey,
    queryFn: () => workspaceService.listMine(),
  });
}

/** Workspace activo derivado (store + lista). Si el id guardado no existe, cae al primero. */
export function useActiveWorkspace(): {
  active: WorkspaceWithRole | null;
  workspaces: WorkspaceWithRole[];
  isLoading: boolean;
  setActive: (id: string) => void;
} {
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActive = useWorkspaceStore((s) => s.setActive);

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;
  return { active, workspaces, isLoading, setActive };
}
