import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { SplashScreen } from '@/app/screens/SplashScreen';
import { useWorkspaces } from '@/modules/workspace/hooks/useWorkspaces';
import { useWorkspaceStore } from '@/modules/workspace/store/workspace.store';

/**
 * Gating por Workspace (Cap. 6.2): sin Workspace → crear; con Workspace → continúa.
 * Sincroniza el workspace activo si el guardado ya no es válido.
 */
export function WorkspaceGate() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActive = useWorkspaceStore((s) => s.setActive);

  useEffect(() => {
    if (isLoading || !workspaces || workspaces.length === 0) return;
    if (!workspaces.some((w) => w.id === activeId)) {
      setActive(workspaces[0]!.id);
    }
  }, [isLoading, workspaces, activeId, setActive]);

  const list = workspaces ?? [];
  if (isLoading) return <SplashScreen />;
  // Ante error de carga no bloqueamos con splash infinito: enviamos a crear espacio.
  if (isError || list.length === 0) return <Navigate to={ROUTES.createWorkspace} replace />;

  return <Outlet />;
}
