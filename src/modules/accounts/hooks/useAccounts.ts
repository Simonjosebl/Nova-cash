import { useQuery } from '@tanstack/react-query';
import { accountService } from '../services/AccountService';

export const accountsKey = (workspaceId: string) => ['accounts', workspaceId] as const;

export function useAccounts(workspaceId: string) {
  return useQuery({
    queryKey: accountsKey(workspaceId),
    queryFn: () => accountService.list(workspaceId),
    enabled: !!workspaceId,
  });
}
