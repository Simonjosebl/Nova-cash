import { useQuery } from '@tanstack/react-query';
import { budgetService } from '../services/BudgetService';

export const budgetsKey = (workspaceId: string) => ['budgets', workspaceId] as const;

/** Presupuestos con su avance del mes (Cap. 6.12). */
export function useBudgets(workspaceId: string) {
  return useQuery({
    queryKey: budgetsKey(workspaceId),
    queryFn: () => budgetService.listWithProgress(workspaceId),
    enabled: !!workspaceId,
  });
}
