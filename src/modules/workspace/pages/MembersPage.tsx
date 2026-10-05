import { Link } from 'react-router-dom';
import { ArrowLeft, Send, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '../hooks/useWorkspaces';
import { useMembers, useRemoveMember } from '../hooks/useMembers';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { FormSuccess } from '@/modules/auth/components/FormSuccess';
import { useInvitations, useCancelInvitation, useResendInvitation } from '../hooks/useInvitations';
import { InviteForm } from '../components/InviteForm';
import { ShareInvitationButton } from '../components/ShareInvitationButton';
import { ROLE_LABELS } from '../constants/workspace.constants';

/** Colaboradores (Cap. 6.16 / R-11). El admin invita y gestiona; todo colaborador es editor. */
export function MembersPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const isAdmin = active?.role === 'admin';

  const { data: members = [], isLoading } = useMembers(workspaceId);
  const { data: invitations = [] } = useInvitations(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const cancelInvite = useCancelInvitation(workspaceId);
  const resendInvite = useResendInvitation();

  if (!active) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Colaboradores</h1>
      </header>

      <section className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-body text-muted-foreground">Cargando…</p>
        ) : (
          members.map((m) => {
            const isOwner = m.profileId === active.ownerId;
            return (
              <Card key={m.id} className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-body font-bold text-primary-foreground">
                  {(m.name || m.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-foreground">
                    {m.name || m.email}
                  </p>
                  <p className="truncate text-caption text-muted-foreground">{m.email}</p>
                </div>
                {isAdmin && !isOwner ? (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-muted-foreground">
                      {ROLE_LABELS[m.role]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar"
                      onClick={() => removeMember.mutate(m.id)}
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <span className="text-caption text-muted-foreground">
                    {isOwner ? 'Propietario' : ROLE_LABELS[m.role]}
                  </span>
                )}
              </Card>
            );
          })
        )}
      </section>

      {invitations.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
            Invitaciones pendientes
          </h2>
          {resendInvite.isError ? (
            <FormError message={getErrorMessage(resendInvite.error)} />
          ) : null}
          {resendInvite.isSuccess ? <FormSuccess message="Invitación reenviada." /> : null}
          {invitations.map((inv) => (
            <Card key={inv.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-foreground">{inv.email}</p>
                <p className="text-caption text-muted-foreground">{ROLE_LABELS[inv.role]}</p>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-1">
                  <ShareInvitationButton token={inv.token} workspaceName={active.name} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Reenviar invitación"
                    title="Reenviar invitación"
                    disabled={resendInvite.isPending}
                    onClick={() => resendInvite.mutate(inv.id)}
                  >
                    <Send />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cancelar invitación"
                    title="Cancelar invitación"
                    onClick={() => cancelInvite.mutate(inv.id)}
                  >
                    <X />
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </section>
      ) : null}

      {isAdmin ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
            Invitar colaborador
          </h2>
          <InviteForm workspaceId={workspaceId} />
        </section>
      ) : null}
    </div>
  );
}
