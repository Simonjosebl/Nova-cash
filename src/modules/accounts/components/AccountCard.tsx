import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { formatMoney } from '@/shared/utils/money';
import { ACCOUNT_TYPE_LABELS } from '../constants/account.constants';
import type { Account } from '../types/account.types';

interface AccountCardProps {
  account: Account;
  canEdit: boolean;
  onEdit: (account: Account) => void;
  onMove?: (direction: 'up' | 'down') => void;
  isFirst?: boolean;
  isLast?: boolean;
}

/** Tarjeta de cuenta (Cap. 6.8): emoji, nombre, tipo, saldo. Reordenar con flechas. */
export function AccountCard({
  account,
  canEdit,
  onEdit,
  onMove,
  isFirst,
  isLast,
}: AccountCardProps) {
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

      {canEdit && onMove ? (
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Subir"
            disabled={isFirst}
            onClick={() => onMove('up')}
            className="text-muted-foreground disabled:opacity-30"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Bajar"
            disabled={isLast}
            onClick={() => onMove('down')}
            className="text-muted-foreground disabled:opacity-30"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      ) : null}
    </Card>
  );
}
