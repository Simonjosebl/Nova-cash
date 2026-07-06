import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { AuthShell } from '../components/AuthShell';
import { FormError } from '../components/FormError';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useLogin';

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();

  const onSubmit = handleSubmit((data) => login.mutate(data));

  return (
    <AuthShell
      title="Bienvenido"
      subtitle="Ingresa para continuar"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.register} className="font-semibold text-nova-blue">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {login.isError ? <FormError message={getErrorMessage(login.error)} /> : null}

        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="-mt-2 flex justify-end">
          <Link to={ROUTES.forgotPassword} className="text-caption text-nova-blue">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      <Button variant="ghost" asChild>
        <Link to={ROUTES.magicLink}>Ingresar con enlace mágico ✨</Link>
      </Button>
    </AuthShell>
  );
}
