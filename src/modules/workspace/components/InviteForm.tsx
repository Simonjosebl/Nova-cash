import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { FormSuccess } from '@/modules/auth/components/FormSuccess';
import { inviteMemberSchema, type InviteMemberInput } from '../schemas/workspace.schema';
import { useInviteMember } from '../hooks/useInvitations';

/** Formulario de invitación (Cap. 6.16 / R-11). El colaborador entra siempre como editor. */
export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '' },
  });
  const invite = useInviteMember(workspaceId);

  const onSubmit = handleSubmit((data) =>
    invite.mutate(data, { onSuccess: () => reset({ email: '' }) }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {invite.isError ? <FormError message={getErrorMessage(invite.error)} /> : null}
      {invite.isSuccess ? (
        <FormSuccess message="Listo. Le enviamos un correo con el enlace para unirse." />
      ) : null}

      <TextField
        label="Correo"
        type="email"
        placeholder="persona@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <p className="-mt-2 text-caption text-muted-foreground">
        Entrará como <span className="font-semibold text-foreground">Editor</span>: podrá ver y
        registrar movimientos en este espacio. Debe ingresar con este mismo correo.
      </p>
      <Button type="submit" disabled={invite.isPending}>
        {invite.isPending ? 'Enviando…' : 'Enviar invitación'}
      </Button>
    </form>
  );
}
