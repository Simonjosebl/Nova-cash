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
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const forgot = useForgotPassword();

  const onSubmit = handleSubmit((data) => forgot.mutate(data));

  return (
    <AuthShell
      title="Recupera tu acceso"
      subtitle="Te enviaremos instrucciones a tu correo"
      footer={
        <Link to={ROUTES.login} className="font-semibold text-nova-blue">
          Volver a ingresar
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <FormSuccess message="Si el correo existe, te enviamos instrucciones para restablecer tu contraseña." />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {forgot.isError ? <FormError message={getErrorMessage(forgot.error)} /> : null}
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" disabled={forgot.isPending}>
            {forgot.isPending ? 'Enviando…' : 'Enviar instrucciones'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
