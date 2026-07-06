import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { TextField } from '@/shared/ui/text-field';
import { AmountInput } from '@/shared/ui/amount-input';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { createBudgetSchema, type CreateBudgetInput } from '../schemas/budget.schema';
import { useCreateBudget, useUpdateBudget } from '../hooks/useBudgetMutations';
import type { BudgetProgress } from '../types/budget.types';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  budget?: BudgetProgress;
  takenCategoryIds: string[];
}

/** Formulario de presupuesto (Cap. 6.12): categoría + monto + umbral de aviso. */
export function BudgetFormSheet({
  open,
  onClose,
  workspaceId,
  currency,
  budget,
  takenCategoryIds,
}: Props) {
  const isEdit = !!budget;
  const { data: categories = [] } = useCategories(workspaceId);
  const create = useCreateBudget(workspaceId);
  const update = useUpdateBudget(workspaceId);

  const available = categories.filter(
    (c) => c.type === 'expense' && !takenCategoryIds.includes(c.id),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: budget
      ? {
          categoryId: budget.categoryId,
          amount: budget.amount,
          warningPercentage: budget.warningPercentage,
        }
      : { categoryId: '', amount: 0, warningPercentage: 80 },
  });

  const onSubmit = handleSubmit((data) => {
    if (isEdit && budget) {
      update.mutate(
        {
          id: budget.id,
          input: { amount: data.amount, warningPercentage: data.warningPercentage },
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
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar presupuesto' : 'Nuevo presupuesto'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        {isEdit ? (
          <div className="flex items-center gap-2 text-body text-foreground">
            <span className="text-2xl">{budget.categoryEmoji}</span>
            <span className="font-medium">{budget.categoryName}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-category">Categoría</Label>
            <Select id="budget-category" {...register('categoryId')}>
              <option value="">Elige una categoría</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </Select>
            {errors.categoryId ? (
              <p className="text-caption text-destructive">{errors.categoryId.message}</p>
            ) : null}
            {available.length === 0 ? (
              <p className="text-caption text-muted-foreground">
                Ya asignaste presupuesto a todas tus categorías de gasto.
              </p>
            ) : null}
          </div>
        )}

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <AmountInput
              label="Monto del presupuesto"
              currency={currency}
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
            />
          )}
        />

        <TextField
          label="Avisar al alcanzar (%)"
          type="number"
          error={errors.warningPercentage?.message}
          {...register('warningPercentage', { valueAsNumber: true })}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear presupuesto'}
        </Button>
      </form>
    </BottomSheet>
  );
}
