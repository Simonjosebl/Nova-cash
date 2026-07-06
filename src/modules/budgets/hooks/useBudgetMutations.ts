import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { budgetService } from '../services/BudgetService';
import { budgetsKey } from './useBudgets';
import type { CreateBudgetInput, UpdateBudgetInput } from '../schemas/budget.schema';

/** Invalida presupuestos + dashboard (los presupuestos alimentan Nova Insights). */
function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: budgetsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
    ]);
}

export function useCreateBudget(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetService.create(workspaceId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateBudget(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      budgetService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBudget(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => budgetService.remove(id),
    onSuccess: invalidate,
  });
}
