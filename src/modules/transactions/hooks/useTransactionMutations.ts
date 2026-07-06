import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsKey } from '@/modules/accounts/hooks/useAccounts';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { transactionService } from '../services/TransactionService';
import type { CreateTransactionDTO } from '../types/transaction.types';

/**
 * Invalidación en cascada (Cap. 6.10): al mover dinero se actualizan
 * movimientos + cuentas (saldos) + dashboard (resumen/insights) sin recargar.
 */
function useCascadeInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] }),
      queryClient.invalidateQueries({ queryKey: accountsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
    ]);
}

export function useCreateTransaction(workspaceId: string) {
  const invalidate = useCascadeInvalidate(workspaceId);
  return useMutation({
    mutationFn: (dto: CreateTransactionDTO) => transactionService.create(workspaceId, dto),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction(workspaceId: string) {
  const invalidate = useCascadeInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateTransactionDTO }) =>
      transactionService.update(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction(workspaceId: string) {
  const invalidate = useCascadeInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => transactionService.remove(id),
    onSuccess: invalidate,
  });
}
