export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Transaction {
  id: string;
  workspaceId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  notes: string | null;
  // Datos de presentación (joins) para el historial:
  categoryName: string | null;
  categoryEmoji: string | null;
  accountName: string | null;
  accountEmoji: string | null;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  description?: string | null;
  date: string;
  notes?: string | null;
}

export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;

export interface TransactionFilters {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
