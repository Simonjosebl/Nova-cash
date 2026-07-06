import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { AuthShell } from '../components/AuthShell';
import { FormError } from '../components/FormError';
import { FormSuccess } from '../components/FormSuccess';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';
import { useRegister } from '../hooks/useRegister';

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const signUp = useRegister();

  const onSubmit = handleSubmit((data) => signUp.mutate(data));
  const needsConfirmation = signUp.isSuccess && signUp.data?.needsConfirmation;

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza a comprender tu dinero"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.login} className="font-semibold text-nova-blue">
            Ingresar
          </Link>
        </>
      }
    >
      {needsConfirmation ? (
        <FormSuccess message="Te enviamos un correo para confirmar tu cuenta. Revísalo para continuar." />
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {signUp.isError ? <FormError message={getErrorMessage(signUp.error)} /> : null}

        <TextField
          label="Nombre"
          autoComplete="name"
          placeholder="Tu nombre"
          error={errors.name?.message}
          {...register('name')}
        />
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

        <Button type="submit" disabled={signUp.isPending}>
          {signUp.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  );
}
