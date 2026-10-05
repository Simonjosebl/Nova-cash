import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { AuthShell } from '../components/AuthShell';
import { FormError } from '../components/FormError';
import { FormSuccess } from '../components/FormSuccess';
import { GoogleButton } from '../components/GoogleButton';
import { AuthDivider } from '../components/AuthDivider';
import { PolicyConsent } from '../components/PolicyConsent';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';
import { useRegister } from '../hooks/useRegister';

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptPolicies: false },
  });
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

      <GoogleButton />
      <AuthDivider />

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {signUp.isError ? <FormError message={getErrorMessage(signUp.error)} /> : null}

        <TextField
          label="Nombre"
          autoComplete="name"
          icon={UserRound}
          placeholder="Tu nombre"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="tu@correo.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          icon={LockKeyhole}
          placeholder="Mínimo 10, con letras y números"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          icon={LockKeyhole}
          placeholder="Repite tu contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <PolicyConsent error={errors.acceptPolicies?.message} {...register('acceptPolicies')} />

        <Button type="submit" disabled={signUp.isPending}>
          {signUp.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  );
}
