import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { accountService } from '../services/AccountService';
import { accountsKey } from './useAccounts';
import { budgetsKey } from '@/modules/budgets/hooks/useBudgets';
import { transactionsKey } from '@/modules/transactions/hooks/useTransactions';
import type { CreateAccountInput, UpdateAccountInput } from '../schemas/account.schema';

/** Invalida cuentas, dashboard, movimientos y presupuestos (eliminar una cuenta oculta sus movimientos). */
function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: accountsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: transactionsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: budgetsKey(workspaceId) }),
    ]);
}

export function useCreateAccount(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountService.create(workspaceId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateAccount(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      accountService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAccount(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => accountService.remove(id),
    onSuccess: invalidate,
  });
}
