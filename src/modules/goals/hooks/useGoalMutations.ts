import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { goalService } from '../services/GoalService';
import { goalsKey } from './useGoals';
import type { GoalInput } from '../schemas/goal.schema';
import type { Goal, UpdateGoalDTO } from '../types/goal.types';

/** Invalida metas + dashboard (las metas alimentan Nova Insights). */
function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: goalsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
    ]);
}

export function useCreateGoal(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (input: GoalInput) =>
      goalService.create(workspaceId, {
        name: input.name,
        emoji: input.emoji,
        targetAmount: input.targetAmount,
        targetDate: input.targetDate || null,
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateGoal(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalDTO }) =>
      goalService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteGoal(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => goalService.remove(id),
    onSuccess: invalidate,
  });
}

export function useDepositGoal(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ goal, amount }: { goal: Goal; amount: number }) =>
      goalService.deposit(goal, amount),
    onSuccess: invalidate,
  });
}

export function useWithdrawGoal(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ goal, amount }: { goal: Goal; amount: number }) =>
      goalService.withdraw(goal, amount),
    onSuccess: invalidate,
  });
}
