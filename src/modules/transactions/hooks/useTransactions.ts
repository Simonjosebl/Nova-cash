import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/TransactionService';
import type { TransactionFilters } from '../types/transaction.types';

export const transactionsKey = (workspaceId: string, filters: TransactionFilters = {}) =>
  ['transactions', workspaceId, filters] as const;

export function useTransactions(workspaceId: string, filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionsKey(workspaceId, filters),
    queryFn: () => transactionService.list(workspaceId, filters),
    enabled: !!workspaceId,
  });
}
