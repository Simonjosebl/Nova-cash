import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { CurrencyPicker } from '@/shared/ui/currency-picker';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { getErrorMessage } from '@/shared/types/app-error';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { FormError } from '@/modules/auth/components/FormError';
import { createAccountSchema, type CreateAccountInput } from '../schemas/account.schema';
import { useCreateAccount, useDeleteAccount, useUpdateAccount } from '../hooks/useAccountMutations';
import { ACCOUNT_EMOJIS, ACCOUNT_TYPES } from '../constants/account.constants';
import type { Account } from '../types/account.types';

interface AccountFormSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  /** Moneda predeterminada del espacio (R-08). */
  currency: string;
  account?: Account;
}

/**
 * Formulario de cuenta (Cap. 6.8 / R-09): emoji, nombre, tipo y moneda. Toda cuenta nace
 * con saldo 0 y se mueve con ingresos y gastos. La moneda solo se elige al crear.
 */
export function AccountFormSheet({
  open,
  onClose,
  workspaceId,
  currency,
  account,
}: AccountFormSheetProps) {
  const isEdit = !!account;
  const create = useCreateAccount(workspaceId);
  const update = useUpdateAccount(workspaceId);
  const remove = useDeleteAccount(workspaceId);
  const confirm = useConfirm();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: account
      ? { name: account.name, emoji: account.emoji, type: account.type, currency: account.currency }
      : { name: '', emoji: '💵', type: 'cash', currency },
  });

  const onSubmit = handleSubmit((data) => {
    if (isEdit && account) {
      update.mutate(
        { id: account.id, input: { name: data.name, emoji: data.emoji, type: data.type } },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(data, { onSuccess: onClose });
    }
  });

  const onDelete = async () => {
    if (!account) return;
    const ok = await confirm({
      title: '¿Eliminar esta cuenta?',
      description:
        'También se eliminarán sus movimientos y dejarán de contar en tus saldos y reportes.',
      emoji: account.emoji,
    });
    if (ok) remove.mutate(account.id, { onSuccess: onClose });
  };

  const error = create.error ?? update.error;
  const isPending = create.isPending || update.isPending;

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Editar cuenta' : 'Nueva cuenta'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <div className="flex flex-col gap-2">
          <Label>Emoji</Label>
          <Controller
            control={control}
            name="emoji"
            render={({ field }) => (
              <EmojiPicker value={field.value} onChange={field.onChange} emojis={ACCOUNT_EMOJIS} />
            )}
          />
        </div>

        <TextField
          label="Nombre"
          placeholder="Bancolombia"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-type">Tipo</Label>
          <Select id="account-type" {...register('type')}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </option>
            ))}
          </Select>
        </div>

        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencyPicker
              id="account-currency"
              label="Moneda"
              value={field.value}
              onChange={field.onChange}
              disabled={isEdit}
              error={errors.currency?.message}
              hint={
                isEdit
                  ? 'La moneda de una cuenta no se cambia después de crearla.'
                  : 'La cuenta empieza en 0 y se mueve con tus ingresos y gastos.'
              }
            />
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </form>

      {remove.isError ? (
        <div className="mt-3">
          <FormError message={getErrorMessage(remove.error)} />
        </div>
      ) : null}

      {isEdit ? (
        <Button
          variant="danger"
          className="mt-3 w-full"
          onClick={onDelete}
          disabled={remove.isPending}
        >
          {remove.isPending ? 'Eliminando…' : 'Eliminar cuenta'}
        </Button>
      ) : null}
    </BottomSheet>
  );
}
