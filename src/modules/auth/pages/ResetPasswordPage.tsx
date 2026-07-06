import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { AuthShell } from '../components/AuthShell';
import { FormError } from '../components/FormError';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.schema';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });
  const reset = useResetPassword();

  const onSubmit = handleSubmit((data) => reset.mutate(data));

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña segura">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {reset.isError ? <FormError message={getErrorMessage(reset.error)} /> : null}
        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" disabled={reset.isPending}>
          {reset.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </AuthShell>
  );
}
