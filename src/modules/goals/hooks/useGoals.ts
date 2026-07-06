import { useQuery } from '@tanstack/react-query';
import { goalService } from '../services/GoalService';

export const goalsKey = (workspaceId: string) => ['goals', workspaceId] as const;

/** Metas con su avance (Cap. 6.13). */
export function useGoals(workspaceId: string) {
  return useQuery({
    queryKey: goalsKey(workspaceId),
    queryFn: () => goalService.listWithProgress(workspaceId),
    enabled: !!workspaceId,
  });
}
