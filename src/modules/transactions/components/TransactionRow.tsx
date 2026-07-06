import { cn } from '@/lib/utils';
import { formatMoney } from '@/shared/utils/money';
import { TRANSACTION_TYPE_EMOJI } from '../constants/transaction.constants';
import type { Transaction } from '../types/transaction.types';

/** Fila del historial (Cap. 6.15). Ingreso en verde; el gasto NO es error (Cap. 3.5). */
export function TransactionRow({
  transaction,
  currency,
  onClick,
}: {
  transaction: Transaction;
  currency: string;
  onClick: (transaction: Transaction) => void;
}) {
  const { type } = transaction;
  const emoji =
    type === 'transfer'
      ? TRANSACTION_TYPE_EMOJI.transfer
      : (transaction.categoryEmoji ?? TRANSACTION_TYPE_EMOJI[type]);
  const title =
    transaction.description ||
    transaction.categoryName ||
    (type === 'transfer' ? 'Transferencia' : transaction.accountName) ||
    'Movimiento';
  const sign = type === 'expense' ? '-' : type === 'income' ? '+' : '';

  return (
    <button
      type="button"
      onClick={() => onClick(transaction)}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left active:bg-secondary"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-xl">
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body text-foreground">{title}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {transaction.accountName}
        </span>
      </span>
      <span
        className={cn(
          'text-body font-semibold',
          type === 'income' ? 'text-success' : 'text-foreground',
        )}
      >
        {sign}
        {formatMoney(transaction.amount, currency)}
      </span>
    </button>
  );
}
