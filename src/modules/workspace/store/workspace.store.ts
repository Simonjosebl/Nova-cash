import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workspace activo (Cap. 2.12). Un usuario pertenece a varios y alterna entre ellos
 * (Resolución R-01). Se persiste el id; la lista vive en TanStack Query.
 */
interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActive: (id: string) => void;
  clear: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActive: (id) => set({ activeWorkspaceId: id }),
      clear: () => set({ activeWorkspaceId: null }),
    }),
    { name: 'nova-active-workspace' },
  ),
);
