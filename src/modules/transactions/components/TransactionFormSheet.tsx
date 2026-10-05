import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { AmountInput } from '@/shared/ui/amount-input';
import { SegmentControl } from '@/shared/ui/segment-control';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { transactionSchema, type TransactionInput } from '../schemas/transaction.schema';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactionMutations';
import type { Transaction, TransactionType } from '../types/transaction.types';
import { useConfirm } from '@/shared/hooks/useConfirm';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  initialType: TransactionType;
  transaction?: Transaction;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Registrar movimiento (Cap. 6.10 / R-15). Gasto o ingreso en < 20s. */
export function TransactionFormSheet({
  open,
  onClose,
  workspaceId,
  currency,
  initialType,
  transaction,
}: Props) {
  const isEdit = !!transaction;
  const { data: accounts = [] } = useAccounts(workspaceId);
  const { data: categories = [] } = useCategories(workspaceId);
  const create = useCreateTransaction(workspaceId);
  const update = useUpdateTransaction(workspaceId);
  const confirm = useConfirm();
  const remove = useDeleteTransaction(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type === 'income' ? 'income' : 'expense',
          amount: transaction.amount,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId ?? '',
          description: transaction.description ?? '',
          date: transaction.date,
          notes: transaction.notes ?? '',
        }
      : {
          type: initialType === 'income' ? 'income' : 'expense',
          amount: 0,
          accountId: accounts[0]?.id ?? '',
          categoryId: '',
          description: '',
          date: today(),
          notes: '',
        },
  });

  const type = watch('type');
  // El monto se expresa en la moneda de la cuenta elegida (R-08).
  const accountCurrency = accounts.find((a) => a.id === watch('accountId'))?.currency ?? currency;
  const relevantCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense',
  );

  const onSubmit = handleSubmit((data) => {
    const dto = {
      type: data.type,
      amount: data.amount,
      accountId: data.accountId,
      toAccountId: null,
      categoryId: data.categoryId,
      description: data.description || null,
      date: data.date,
      notes: data.notes || null,
    };
    if (isEdit && transaction) {
      update.mutate({ id: transaction.id, dto }, { onSuccess: onClose });
    } else {
      create.mutate(dto, { onSuccess: onClose });
    }
  });

  const error = create.error ?? update.error;
  const isPending = create.isPending || update.isPending;

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Editar movimiento' : 'Registrar'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <Controller
          control={control}
          name="type"
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

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <AmountInput
              label="Monto"
              currency={accountCurrency}
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
            />
          )}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-account">Cuenta</Label>
          <Select id="tx-account" {...register('accountId')}>
            <option value="">Elige una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name}
              </option>
            ))}
          </Select>
          {errors.accountId ? (
            <p className="text-caption text-destructive">{errors.accountId.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-category">Categoría</Label>
          <Select id="tx-category" {...register('categoryId')}>
            <option value="">Elige una categoría</option>
            {relevantCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </Select>
          {errors.categoryId ? (
            <p className="text-caption text-destructive">{errors.categoryId.message}</p>
          ) : null}
        </div>

        <TextField
          label="Descripción"
          placeholder="Opcional"
          error={errors.description?.message}
          {...register('description')}
        />

        <TextField label="Fecha" type="date" error={errors.date?.message} {...register('date')} />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar'}
        </Button>
      </form>

      {isEdit && transaction ? (
        <Button
          variant="danger"
          className="mt-3 w-full"
          onClick={async () => {
            const ok = await confirm({
              title: '¿Eliminar este movimiento?',
              description: 'Tus saldos y reportes se recalcularán.',
              emoji: '💸',
            });
            if (ok) remove.mutate(transaction.id, { onSuccess: onClose });
          }}
        >
          Eliminar
        </Button>
      ) : null}
    </BottomSheet>
  );
}
