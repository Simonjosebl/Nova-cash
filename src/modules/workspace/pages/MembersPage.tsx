import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Select } from '@/shared/ui/select';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '../hooks/useWorkspaces';
import { useMembers, useChangeMemberRole, useRemoveMember } from '../hooks/useMembers';
import { useInvitations, useCancelInvitation } from '../hooks/useInvitations';
import { InviteForm } from '../components/InviteForm';
import { ROLE_LABELS } from '../constants/workspace.constants';
import type { MemberRole } from '../types/workspace.types';

/** Colaboradores (Cap. 6.16). El admin gestiona; el resto ve la lista. */
export function MembersPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const isAdmin = active?.role === 'admin';

  const { data: members = [], isLoading } = useMembers(workspaceId);
  const { data: invitations = [] } = useInvitations(workspaceId);
  const changeRole = useChangeMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const cancelInvite = useCancelInvitation(workspaceId);

  if (!active) return null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
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
                  <div className="flex items-center gap-1">
                    <Select
                      aria-label="Rol"
                      className="h-10 w-28 text-caption"
                      value={m.role}
                      onChange={(e) =>
                        changeRole.mutate({ memberId: m.id, role: e.target.value as MemberRole })
                      }
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Lector</option>
                    </Select>
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
          {invitations.map((inv) => (
            <Card key={inv.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-foreground">{inv.email}</p>
                <p className="text-caption text-muted-foreground">{ROLE_LABELS[inv.role]}</p>
              </div>
              {isAdmin ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancelar invitación"
                  onClick={() => cancelInvite.mutate(inv.id)}
                >
                  <X />
                </Button>
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
    </main>
  );
}
