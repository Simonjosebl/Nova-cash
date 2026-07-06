import { useQuery } from '@tanstack/react-query';
import { accountService } from '../services/AccountService';

export const accountsKey = (workspaceId: string) => ['accounts', workspaceId] as const;
export const archivedAccountsKey = (workspaceId: string) =>
  ['accounts-archived', workspaceId] as const;

export function useAccounts(workspaceId: string) {
  return useQuery({
    queryKey: accountsKey(workspaceId),
    queryFn: () => accountService.list(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useArchivedAccounts(workspaceId: string) {
  return useQuery({
    queryKey: archivedAccountsKey(workspaceId),
    queryFn: () => accountService.listArchived(workspaceId),
    enabled: !!workspaceId,
  });
}
