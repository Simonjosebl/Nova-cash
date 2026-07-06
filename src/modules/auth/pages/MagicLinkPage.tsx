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
import { magicLinkSchema, type MagicLinkInput } from '../schemas/auth.schema';
import { useMagicLink } from '../hooks/useMagicLink';

export function MagicLinkPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkInput>({ resolver: zodResolver(magicLinkSchema) });
  const magicLink = useMagicLink();

  const onSubmit = handleSubmit((data) => magicLink.mutate(data));

  return (
    <AuthShell
      title="Enlace mágico"
      subtitle="Te enviaremos un enlace para entrar sin contraseña"
      footer={
        <Link to={ROUTES.login} className="font-semibold text-nova-blue">
          Volver a ingresar
        </Link>
      }
    >
      {magicLink.isSuccess ? (
        <FormSuccess message="Revisa tu correo y toca el enlace para ingresar." />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {magicLink.isError ? <FormError message={getErrorMessage(magicLink.error)} /> : null}
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" disabled={magicLink.isPending}>
            {magicLink.isPending ? 'Enviando…' : 'Enviar enlace'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
