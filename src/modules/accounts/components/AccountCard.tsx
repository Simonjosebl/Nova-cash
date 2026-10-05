import { Card } from '@/shared/ui/card';
import { formatMoney } from '@/shared/utils/money';
import { ACCOUNT_TYPE_LABELS } from '../constants/account.constants';
import type { Account } from '../types/account.types';

interface AccountCardProps {
  account: Account;
  canEdit: boolean;
  onEdit: (account: Account) => void;
}

/** Tarjeta de cuenta (Cap. 6.8): emoji, nombre, tipo y saldo en su moneda. */
export function AccountCard({ account, canEdit, onEdit }: AccountCardProps) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <button
        type="button"
        onClick={() => canEdit && onEdit(account)}
        className="flex flex-1 items-center gap-3 text-left"
        disabled={!canEdit}
      >
        <span className="text-2xl">{account.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-medium text-foreground">
            {account.name}
          </span>
          <span className="block text-caption text-muted-foreground">
            {ACCOUNT_TYPE_LABELS[account.type]}
          </span>
        </span>
        <span className="text-body font-semibold text-foreground">
          {formatMoney(account.currentBalance, account.currency)}
        </span>
      </button>
    </Card>
  );
}
