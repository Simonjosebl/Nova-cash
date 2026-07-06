import { useState } from 'react';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { formatMoney } from '@/shared/utils/money';
import { formatDateLabel } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import {
  useCancelEvent,
  useDeleteEvent,
  usePostponeEvent,
  useRegisterPayment,
} from '../hooks/useCalendarMutations';
import { EVENT_STATUS_LABELS } from '../constants/calendar.constants';
import type { CalendarEvent } from '../types/calendar.types';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  event: CalendarEvent;
  canEdit: boolean;
  onEdit: (event: CalendarEvent) => void;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Detalle de evento (Cap. 6.11): registrar pago, posponer, editar, cancelar, eliminar. */
export function EventDetailSheet({
  open,
  onClose,
  workspaceId,
  currency,
  event,
  canEdit,
  onEdit,
}: Props) {
  const { data: accounts = [] } = useAccounts(workspaceId);
  const register = useRegisterPayment(workspaceId);
  const postpone = usePostponeEvent(workspaceId);
  const cancel = useCancelEvent(workspaceId);
  const remove = useDeleteEvent(workspaceId);

  const [accountId, setAccountId] = useState(event.accountId ?? accounts[0]?.id ?? '');
  const isPending = event.status === 'pending';

  return (
    <BottomSheet open={open} onClose={onClose} title={`${event.emoji} ${event.title}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-h3 font-bold text-primary">
            {formatMoney(event.amount, currency)}
          </span>
          <span className="text-caption text-muted-foreground">
            {formatDateLabel(event.date)} · {EVENT_STATUS_LABELS[event.status]}
          </span>
        </div>

        {register.isError ? <FormError message={getErrorMessage(register.error)} /> : null}

        {canEdit && isPending ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-pay-account">Registrar desde</Label>
              <Select
                id="ev-pay-account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Elige una cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              disabled={!accountId || register.isPending}
              onClick={() => register.mutate({ event, accountId }, { onSuccess: onClose })}
            >
              {register.isPending ? 'Registrando…' : 'Registrar pago'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => postpone.mutate({ id: event.id, date: addDaysIso(event.date, 7) })}
              >
                Posponer 1 semana
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => onEdit(event)}>
                Editar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => cancel.mutate(event.id, { onSuccess: onClose })}
              >
                Cancelar evento
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  if (window.confirm('¿Eliminar este evento?')) {
                    remove.mutate(event.id, { onSuccess: onClose });
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-body text-muted-foreground">
            {event.status === 'paid'
              ? 'Este evento ya fue registrado.'
              : event.status === 'cancelled'
                ? 'Este evento fue cancelado.'
                : 'Solo un editor puede registrar este pago.'}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
