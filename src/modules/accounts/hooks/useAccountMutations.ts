import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { accountService } from '../services/AccountService';
import { accountsKey, archivedAccountsKey } from './useAccounts';
import type { CreateAccountInput, UpdateAccountInput } from '../schemas/account.schema';

/** Invalida cuentas + dashboard (el saldo depende de las cuentas). */
function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: accountsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: archivedAccountsKey(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
    ]);
}

export function useCreateAccount(workspaceId: string, currency: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountService.create(workspaceId, currency, input),
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

export function useArchiveAccount(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? accountService.archive(id) : accountService.unarchive(id),
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

export function useReorderAccounts(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (orderedIds: string[]) => accountService.reorder(orderedIds),
    onSuccess: invalidate,
  });
}
