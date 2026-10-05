import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { FormError } from '@/modules/auth/components/FormError';
import { reminderSchema, type ReminderInput } from '../schemas/reminder.schema';
import { useReminderMutations } from '../hooks/useReminders';
import { ALL_DAYS, REMINDER_KINDS, WEEKDAYS, WEEKDAYS_ONLY } from '../constants/reminder.constants';
import type { IReminder, IsoWeekday } from '../types/reminder.types';

interface ReminderFormSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  reminder?: IReminder;
}

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-caption font-medium transition-colors',
    active
      ? 'border-accent/50 bg-accent/15 text-foreground'
      : 'border-input bg-card text-muted-foreground hover:text-foreground',
  );

/** Formulario de recordatorio (R-13): qué registrar, a qué hora y qué días. */
export function ReminderFormSheet({
  open,
  onClose,
  workspaceId,
  reminder,
}: ReminderFormSheetProps) {
  const { save, remove } = useReminderMutations(workspaceId);
  const confirm = useConfirm();
  const isEdit = !!reminder;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? { kind: reminder.kind, time: reminder.time, days: reminder.days, enabled: reminder.enabled }
      : { kind: 'any', time: '20:00', days: ALL_DAYS, enabled: true },
  });

  const onSubmit = handleSubmit((dto) =>
    save.mutate({ id: reminder?.id, dto }, { onSuccess: onClose }),
  );

  const onDelete = async () => {
    if (!reminder) return;
    const ok = await confirm({ title: '¿Eliminar este recordatorio?', emoji: '⏰' });
    if (ok) remove.mutate(reminder.id, { onSuccess: onClose });
  };

  const error = save.error ?? remove.error;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar recordatorio' : 'Nuevo recordatorio'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label>¿Qué te recordamos registrar?</Label>
              <div className="grid grid-cols-3 gap-2">
                {REMINDER_KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    aria-pressed={field.value === k.value}
                    onClick={() => field.onChange(k.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-caption font-medium transition-colors',
                      field.value === k.value
                        ? 'border-accent/50 bg-accent/10 text-foreground'
                        : 'border-input bg-card text-muted-foreground',
                    )}
                  >
                    <span className="text-2xl">{k.emoji}</span>
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <TextField label="Hora" type="time" error={errors.time?.message} {...register('time')} />

        <Controller
          control={control}
          name="days"
          render={({ field }) => {
            const selected = new Set<IsoWeekday>(field.value);
            const toggleDay = (day: IsoWeekday) => {
              const next = new Set(selected);
              if (next.has(day)) next.delete(day);
              else next.add(day);
              field.onChange(ALL_DAYS.filter((d) => next.has(d)));
            };
            return (
              <div className="flex flex-col gap-2">
                <Label>Días</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={chip(selected.size === 7)}
                    onClick={() => field.onChange(ALL_DAYS)}
                  >
                    Todos los días
                  </button>
                  <button
                    type="button"
                    className={chip(
                      selected.size === 5 && WEEKDAYS_ONLY.every((d) => selected.has(d)),
                    )}
                    onClick={() => field.onChange(WEEKDAYS_ONLY)}
                  >
                    Entre semana
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      aria-pressed={selected.has(d.value)}
                      aria-label={d.long}
                      onClick={() => toggleDay(d.value)}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-full text-caption font-semibold transition-colors',
                        selected.has(d.value)
                          ? 'bg-gradient-to-br from-nova-blue to-nova-cyan text-white'
                          : 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
                {errors.days ? (
                  <p role="alert" className="text-caption text-destructive">
                    {errors.days.message}
                  </p>
                ) : null}
              </div>
            );
          }}
        />

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear recordatorio'}
        </Button>
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => void onDelete()}
          >
            Eliminar recordatorio
          </Button>
        ) : null}
      </form>
    </BottomSheet>
  );
}
