import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/DashboardService';

export const dashboardKey = (workspaceId: string) => ['dashboard', workspaceId] as const;

/** Carga el Dashboard completo en una sola consulta (Cap. 8). */
export function useDashboard(workspaceId: string, currency: string) {
  return useQuery({
    queryKey: dashboardKey(workspaceId),
    queryFn: () => dashboardService.loadDashboard(workspaceId, currency),
    enabled: !!workspaceId,
  });
}
