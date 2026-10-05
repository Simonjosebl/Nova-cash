import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AlarmClock, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { CurrencyPicker } from '@/shared/ui/currency-picker';
import { Select } from '@/shared/ui/select';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { FormError } from '@/modules/auth/components/FormError';
import { FormSuccess } from '@/modules/auth/components/FormSuccess';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from '../schemas/workspace.schema';
import { useActiveWorkspace } from '../hooks/useWorkspaces';
import { useUpdateWorkspace, useDeleteWorkspace } from '../hooks/useWorkspaceMutations';
import { SUGGESTED_EMOJIS, WORKSPACE_TYPES } from '../constants/workspace.constants';
import { useConfirm } from '@/shared/hooks/useConfirm';

/** Configuración del Workspace (Cap. 6.18). Editar identidad; eliminar (admin). */
export function WorkspaceSettingsPage() {
  const navigate = useNavigate();
  const { active } = useActiveWorkspace();
  const isAdmin = active?.role === 'admin';

  const update = useUpdateWorkspace(active?.id ?? '');
  const confirm = useConfirm();
  const remove = useDeleteWorkspace();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: active
      ? { name: active.name, emoji: active.emoji, type: active.type, currency: active.currency }
      : undefined,
  });

  if (!active) return null;
  const emoji = watch('emoji') ?? active.emoji;

  const onSubmit = handleSubmit((data) => update.mutate(data));

  const onDelete = async () => {
    const ok = await confirm({
      title: '¿Eliminar este espacio?',
      description: 'Podrás recuperarlo contactando soporte.',
      emoji: active.emoji,
    });
    if (ok) {
      remove.mutate(active.id, { onSuccess: () => navigate(ROUTES.home, { replace: true }) });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Configuración</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" asChild>
          <Link to={ROUTES.members}>
            <Users />
            Colaboradores
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to={ROUTES.reminders}>
            <AlarmClock />
            Recordatorios
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {update.isError ? <FormError message={getErrorMessage(update.error)} /> : null}
        {update.isSuccess ? <FormSuccess message="Espacio actualizado." /> : null}

        <TextField
          label="Nombre"
          disabled={!isAdmin}
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex flex-col gap-2">
          <Label>Emoji</Label>
          <EmojiPicker
            value={emoji}
            onChange={(e) => setValue('emoji', e)}
            emojis={SUGGESTED_EMOJIS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" disabled={!isAdmin} {...register('type')}>
            {WORKSPACE_TYPES.map((t) => (
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
              id="currency"
              label="Moneda predeterminada"
              disabled={!isAdmin}
              value={field.value}
              onChange={field.onChange}
              error={errors.currency?.message}
              hint="Se usa por defecto en cuentas y presupuestos. Puedes cambiarla cuando quieras; los montos registrados no se convierten."
            />
          )}
        />

        {isAdmin ? (
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        ) : null}
      </form>

      {isAdmin ? (
        <Button variant="danger" onClick={onDelete} disabled={remove.isPending}>
          Eliminar espacio
        </Button>
      ) : null}
    </div>
  );
}
