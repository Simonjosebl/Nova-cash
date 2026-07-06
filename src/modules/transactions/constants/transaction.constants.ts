import type { TransactionType } from '../types/transaction.types';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  adjustment: 'Ajuste',
};

export const TRANSACTION_TYPE_EMOJI: Record<TransactionType, string> = {
  income: '💰',
  expense: '💸',
  transfer: '🔄',
  adjustment: '⚙️',
};

/** Tipos que el usuario puede registrar desde el FAB (Cap. 6.6). */
export const REGISTERABLE_TYPES: ReadonlyArray<{
  type: TransactionType;
  label: string;
  emoji: string;
}> = [
  { type: 'expense', label: 'Nuevo gasto', emoji: '💸' },
  { type: 'income', label: 'Nuevo ingreso', emoji: '💰' },
  { type: 'transfer', label: 'Transferencia', emoji: '🔄' },
];

export const PAGE_SIZE = 30;
