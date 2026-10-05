import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { CurrencyPicker } from '@/shared/ui/currency-picker';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { createWorkspaceSchema, type CreateWorkspaceInput } from '../schemas/workspace.schema';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useCreateWorkspace } from '../hooks/useWorkspaceMutations';
import { SUGGESTED_EMOJIS, WORKSPACE_TYPES } from '../constants/workspace.constants';

/** Crear Workspace (Cap. 6.5). Emoji → Nombre → Tipo → Moneda. Objetivo: < 30s. */
export function CreateWorkspacePage() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '', emoji: '👤', type: 'personal', currency: 'COP' },
  });
  const create = useCreateWorkspace();
  const navigate = useNavigate();
  // Con al menos un espacio se puede volver atrás; el primero es obligatorio (Cap. 6.2).
  const { data: workspaces = [] } = useWorkspaces();
  const canCancel = workspaces.length > 0;

  const emoji = watch('emoji');
  const type = watch('type');

  const onSubmit = handleSubmit((data) => create.mutate(data));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-10">
      <header className="text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-lg bg-secondary text-4xl">
          {emoji}
        </div>
        <h1 className="text-h2 font-bold text-primary">Crea tu espacio</h1>
        <p className="text-body text-muted-foreground">Organiza tu dinero, solo o en equipo.</p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {create.isError ? <FormError message={getErrorMessage(create.error)} /> : null}

        <div className="flex flex-col gap-2">
          <Label>Tipo</Label>
          <div className="grid grid-cols-5 gap-2">
            {WORKSPACE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setValue('type', t.value);
                  setValue('emoji', t.emoji);
                }}
                aria-pressed={type === t.value}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-sm border py-2 text-2xl transition-all active:scale-[0.97]',
                  type === t.value ? 'border-ring bg-secondary' : 'border-input bg-card',
                )}
              >
                <span>{t.emoji}</span>
                <span className="text-small text-muted-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <TextField
          label="Nombre"
          placeholder="Mis finanzas"
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

        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencyPicker
              id="currency"
              label="Moneda predeterminada"
              value={field.value}
              onChange={field.onChange}
              error={errors.currency?.message}
              hint="Se usa por defecto en cuentas y presupuestos. Puedes cambiarla cuando quieras; los montos registrados no se convierten."
            />
          )}
        />

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creando…' : 'Crear espacio'}
        </Button>
        {canCancel ? (
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.profile)}>
            Cancelar
          </Button>
        ) : null}
      </form>
    </main>
  );
}
