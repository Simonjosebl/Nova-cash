import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { AmountInput } from '@/shared/ui/amount-input';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { createAccountSchema, type CreateAccountInput } from '../schemas/account.schema';
import {
  useArchiveAccount,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '../hooks/useAccountMutations';
import { ACCOUNT_EMOJIS, ACCOUNT_TYPES } from '../constants/account.constants';
import type { Account } from '../types/account.types';

interface AccountFormSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currency: string;
  account?: Account;
}

/** Formulario de cuenta (Cap. 6.8): emoji, nombre, tipo, saldo inicial. Crear/editar. */
export function AccountFormSheet({
  open,
  onClose,
  workspaceId,
  currency,
  account,
}: AccountFormSheetProps) {
  const isEdit = !!account;
  const create = useCreateAccount(workspaceId, currency);
  const update = useUpdateAccount(workspaceId);
  const archive = useArchiveAccount(workspaceId);
  const remove = useDeleteAccount(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: account
      ? {
          name: account.name,
          emoji: account.emoji,
          type: account.type,
          openingBalance: account.openingBalance,
        }
      : { name: '', emoji: '💵', type: 'cash', openingBalance: 0 },
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
          name="openingBalance"
          render={({ field }) => (
            <AmountInput
              label="Saldo inicial"
              currency={currency}
              value={field.value}
              onChange={field.onChange}
              disabled={isEdit}
              error={errors.openingBalance?.message}
            />
          )}
        />
        {isEdit ? (
          <p className="-mt-2 text-caption text-muted-foreground">
            El saldo inicial no se edita; se ajusta con movimientos.
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </form>

      {isEdit && account ? (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              archive.mutate(
                { id: account.id, archived: !account.isArchived },
                { onSuccess: onClose },
              )
            }
          >
            {account.isArchived ? 'Desarchivar' : 'Archivar'}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (window.confirm('¿Eliminar esta cuenta?')) {
                remove.mutate(account.id, { onSuccess: onClose });
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      ) : null}
    </BottomSheet>
  );
}
