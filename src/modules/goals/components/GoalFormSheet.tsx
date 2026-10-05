import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { AmountInput } from '@/shared/ui/amount-input';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { goalSchema, type GoalInput } from '../schemas/goal.schema';
import { useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoalMutations';
import { GOAL_EMOJIS } from '../constants/goal.constants';
import type { Goal } from '../types/goal.types';
import { useConfirm } from '@/shared/hooks/useConfirm';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  goal?: Goal;
}

/** Alta/edición de meta (Cap. 6.13). */
export function GoalFormSheet({ open, onClose, workspaceId, currency, goal }: Props) {
  const isEdit = !!goal;
  const create = useCreateGoal(workspaceId);
  const update = useUpdateGoal(workspaceId);
  const confirm = useConfirm();
  const remove = useDeleteGoal(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal
      ? {
          name: goal.name,
          emoji: goal.emoji,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ?? '',
        }
      : { name: '', emoji: '🎯', targetAmount: 0, targetDate: '' },
  });

  const onSubmit = handleSubmit((data) => {
    if (isEdit && goal) {
      update.mutate(
        {
          id: goal.id,
          input: {
            name: data.name,
            emoji: data.emoji,
            targetAmount: data.targetAmount,
            targetDate: data.targetDate || null,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(data, { onSuccess: onClose });
    }
  });

  const error = create.error ?? update.error;
  const isPending = create.isPending || update.isPending;

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Editar meta' : 'Nueva meta'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <div className="flex flex-col gap-2">
          <Label>Emoji</Label>
          <Controller
            control={control}
            name="emoji"
            render={({ field }) => (
              <EmojiPicker value={field.value} onChange={field.onChange} emojis={GOAL_EMOJIS} />
            )}
          />
        </div>

        <TextField
          label="Nombre"
          placeholder="Viaje a Japón"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <AmountInput
              label="Meta"
              currency={currency}
              value={field.value}
              onChange={field.onChange}
              error={errors.targetAmount?.message}
            />
          )}
        />

        <TextField label="Fecha objetivo (opcional)" type="date" {...register('targetDate')} />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear meta'}
        </Button>
      </form>

      {isEdit && goal ? (
        <Button
          variant="danger"
          className="mt-3 w-full"
          onClick={async () => {
            const ok = await confirm({
              title: '¿Eliminar esta meta?',
              description: 'Perderás el seguimiento de su progreso.',
              emoji: '🎯',
            });
            if (ok) remove.mutate(goal.id, { onSuccess: onClose });
          }}
        >
          Eliminar
        </Button>
      ) : null}
    </BottomSheet>
  );
}
