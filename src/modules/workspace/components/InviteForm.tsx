import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { FormSuccess } from '@/modules/auth/components/FormSuccess';
import { inviteMemberSchema, type InviteMemberInput } from '../schemas/workspace.schema';
import { useInviteMember } from '../hooks/useInvitations';

/** Formulario de invitación (Cap. 6.16). Solo editor o lector; el admin no se invita. */
export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', role: 'editor' },
  });
  const invite = useInviteMember(workspaceId);

  const onSubmit = handleSubmit((data) =>
    invite.mutate(data, { onSuccess: () => reset({ email: '', role: 'editor' }) }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {invite.isError ? <FormError message={getErrorMessage(invite.error)} /> : null}
      {invite.isSuccess ? <FormSuccess message="Invitación enviada." /> : null}

      <TextField
        label="Correo"
        type="email"
        placeholder="persona@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-role">Rol</Label>
        <Select id="invite-role" {...register('role')}>
          <option value="editor">Editor</option>
          <option value="viewer">Lector</option>
        </Select>
      </div>
      <Button type="submit" disabled={invite.isPending}>
        {invite.isPending ? 'Enviando…' : 'Enviar invitación'}
      </Button>
    </form>
  );
}
