import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { AmountInput } from '@/shared/ui/amount-input';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { SegmentControl } from '@/shared/ui/segment-control';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { eventSchema, type EventInput } from '../schemas/calendar.schema';
import { useCreateEvent, useUpdateEvent } from '../hooks/useCalendarMutations';
import { EVENT_EMOJIS } from '../constants/calendar.constants';
import type { CalendarEvent } from '../types/calendar.types';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  defaultDate: string;
  event?: CalendarEvent;
}

/** Alta/edición de evento del calendario (Cap. 6.11). */
export function EventFormSheet({
  open,
  onClose,
  workspaceId,
  currency,
  defaultDate,
  event,
}: Props) {
  const isEdit = !!event;
  const { data: accounts = [] } = useAccounts(workspaceId);
  const { data: categories = [] } = useCategories(workspaceId);
  const create = useCreateEvent(workspaceId);
  const update = useUpdateEvent(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          emoji: event.emoji,
          flow: event.flow,
          amount: event.amount,
          accountId: event.accountId ?? '',
          categoryId: event.categoryId ?? '',
          date: event.date,
          notes: event.notes ?? '',
          repeatMonthly: false,
        }
      : {
          title: '',
          emoji: '🏠',
          flow: 'expense',
          amount: 0,
          accountId: '',
          categoryId: '',
          date: defaultDate,
          notes: '',
          repeatMonthly: false,
        },
  });

  const flow = watch('flow');
  const relevant = categories.filter((c) => c.type === flow);

  const onSubmit = handleSubmit((data) => {
    const dto = {
      title: data.title,
      emoji: data.emoji,
      flow: data.flow,
      amount: data.amount,
      accountId: data.accountId || null,
      categoryId: data.categoryId || null,
      date: data.date,
      notes: data.notes || null,
      repeatMonthly: data.repeatMonthly,
    };
    if (isEdit && event) {
      update.mutate({ id: event.id, dto }, { onSuccess: onClose });
    } else {
      create.mutate(dto, { onSuccess: onClose });
    }
  });

  const error = create.error ?? update.error;
  const isPending = create.isPending || update.isPending;

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Editar evento' : 'Nuevo evento'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <Controller
          control={control}
          name="flow"
          render={({ field }) => (
            <SegmentControl
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'expense', label: 'Gasto' },
                { value: 'income', label: 'Ingreso' },
              ]}
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <Label>Emoji</Label>
          <Controller
            control={control}
            name="emoji"
            render={({ field }) => (
              <EmojiPicker value={field.value} onChange={field.onChange} emojis={EVENT_EMOJIS} />
            )}
          />
        </div>

        <TextField
          label="Nombre"
          placeholder="Arriendo"
          error={errors.title?.message}
          {...register('title')}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <AmountInput
              label="Monto"
              currency={currency}
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
            />
          )}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-category">Categoría</Label>
          <Select id="ev-category" {...register('categoryId')}>
            <option value="">Elige una categoría</option>
            {relevant.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </Select>
          {errors.categoryId ? (
            <p className="text-caption text-destructive">{errors.categoryId.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-account">Cuenta (opcional)</Label>
          <Select id="ev-account" {...register('accountId')}>
            <option value="">Sin asignar</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name}
              </option>
            ))}
          </Select>
        </div>

        <TextField label="Fecha" type="date" error={errors.date?.message} {...register('date')} />

        {!isEdit ? (
          <label className="flex items-center gap-2 text-body text-foreground">
            <input
              type="checkbox"
              className="size-5 accent-nova-blue"
              {...register('repeatMonthly')}
            />
            Repetir cada mes (gasto fijo)
          </label>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </form>
    </BottomSheet>
  );
}
