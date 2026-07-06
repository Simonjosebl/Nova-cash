import { useState } from 'react';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { AmountInput } from '@/shared/ui/amount-input';
import { formatMoney } from '@/shared/utils/money';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { useDepositGoal, useWithdrawGoal } from '../hooks/useGoalMutations';
import type { GoalProgress } from '../types/goal.types';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  goal: GoalProgress;
  canEdit: boolean;
  onEdit: (goal: GoalProgress) => void;
}

/** Detalle de meta (Cap. 6.13): progreso + aportar / retirar. */
export function GoalDetailSheet({
  open,
  onClose,
  workspaceId,
  currency,
  goal,
  canEdit,
  onEdit,
}: Props) {
  const deposit = useDepositGoal(workspaceId);
  const withdraw = useWithdrawGoal(workspaceId);
  const [amount, setAmount] = useState(0);

  const error = deposit.error ?? withdraw.error;
  const busy = deposit.isPending || withdraw.isPending;

  return (
    <BottomSheet open={open} onClose={onClose} title={`${goal.emoji} ${goal.name}`}>
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex items-end justify-between">
            <span className="text-h3 font-bold text-primary">
              {formatMoney(goal.currentAmount, currency)}
            </span>
            <span className="text-caption text-muted-foreground">
              de {formatMoney(goal.targetAmount, currency)}
            </span>
          </div>
          <ProgressBar percent={goal.percent} barClass="bg-success" />
          <p className="mt-1 text-caption text-muted-foreground">
            {goal.status === 'completed'
              ? '¡Meta completada! 🎉'
              : `Faltan ${formatMoney(goal.remaining, currency)}`}
          </p>
        </div>

        {error ? <FormError message={getErrorMessage(error)} /> : null}

        {canEdit ? (
          <>
            <AmountInput label="Monto" currency={currency} value={amount} onChange={setAmount} />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={busy || amount <= 0}
                onClick={() => deposit.mutate({ goal, amount }, { onSuccess: () => setAmount(0) })}
              >
                Aportar
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={busy || amount <= 0}
                onClick={() => withdraw.mutate({ goal, amount }, { onSuccess: () => setAmount(0) })}
              >
                Retirar
              </Button>
            </div>
            <Button variant="ghost" onClick={() => onEdit(goal)}>
              Editar meta
            </Button>
          </>
        ) : null}
      </div>
    </BottomSheet>
  );
}
