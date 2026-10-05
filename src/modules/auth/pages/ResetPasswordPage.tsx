import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { SplashScreen } from '@/app/screens/SplashScreen';
import { useAuth } from '../hooks/useAuth';
import { AuthShell } from '../components/AuthShell';
import { FormError } from '../components/FormError';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.schema';
import { useResetPassword } from '../hooks/useResetPassword';

/**
 * Nueva contraseña (Cap. 6.4). Se llega desde el enlace del correo, que abre una sesión de
 * recuperación. Sin esa sesión (enlace vencido, usado u abierto en otro navegador) se ofrece
 * pedir uno nuevo.
 */
export function ResetPasswordPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });
  const reset = useResetPassword();

  const onSubmit = handleSubmit((data) => reset.mutate(data));

  if (isLoading) return <SplashScreen />;

  if (!isAuthenticated) {
    return (
      <AuthShell title="Enlace no válido" subtitle="Tu enlace venció o ya fue usado">
        <p className="text-center text-body text-muted-foreground">
          Por seguridad, cada enlace sirve una sola vez y por tiempo limitado. Ábrelo en el mismo
          navegador donde lo pediste o solicita uno nuevo.
        </p>
        <Button asChild>
          <Link to={ROUTES.forgotPassword}>Pedir un enlace nuevo</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to={ROUTES.login}>Volver a ingresar</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña segura">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {reset.isError ? <FormError message={getErrorMessage(reset.error)} /> : null}
        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 10, con letras y números"
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
