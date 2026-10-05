import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { getErrorMessage } from '@/shared/types/app-error';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { ROUTES } from '@/shared/constants/routes';
import { FormError } from '@/modules/auth/components/FormError';
import { useActiveWorkspace } from '../hooks/useWorkspaces';
import { useDeleteWorkspace } from '../hooks/useWorkspaceMutations';
import { ROLE_LABELS } from '../constants/workspace.constants';
import type { WorkspaceWithRole } from '../types/workspace.types';

/**
 * Mis espacios (R-12): desde la cuenta se ven, activan, crean, editan y eliminan.
 * Editar y eliminar requieren ser administrador del espacio.
 */
export function MyWorkspaces() {
  const { active, workspaces, setActive } = useActiveWorkspace();
  const remove = useDeleteWorkspace();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Llegando desde "Gestionar espacios" (#espacios), lleva la vista a esta sección.
  useEffect(() => {
    if (hash === '#espacios')
      document.getElementById('espacios')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const edit = (w: WorkspaceWithRole) => {
    setActive(w.id);
    navigate(ROUTES.workspaceSettings);
  };

  const onDelete = async (w: WorkspaceWithRole) => {
    const ok = await confirm({
      title: `¿Eliminar “${w.name}”?`,
      description: 'Se eliminará el espacio con sus cuentas y movimientos para todos sus miembros.',
      emoji: w.emoji,
    });
    if (ok) remove.mutate(w.id);
  };

  return (
    <section id="espacios" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
          Mis espacios
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.createWorkspace}>
            <Plus />
            Crear
          </Link>
        </Button>
      </div>

      {remove.isError ? <FormError message={getErrorMessage(remove.error)} /> : null}

      <ul className="flex flex-col gap-2">
        {workspaces.map((w) => {
          const isActive = w.id === active?.id;
          const isAdmin = w.role === 'admin';
          return (
            <li
              key={w.id}
              className={cn(
                'flex items-center gap-3 rounded-md border bg-card px-4 py-3 shadow-card-glow dark:shadow-card-glow-dark',
                isActive ? 'border-accent/50' : 'border-input',
              )}
            >
              <button
                type="button"
                onClick={() => setActive(w.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-label={`Usar ${w.name}`}
              >
                <span className="text-2xl">{w.emoji}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body font-medium text-foreground">{w.name}</span>
                  <span className="text-small text-muted-foreground">
                    {ROLE_LABELS[w.role]} · {w.currency}
                  </span>
                </span>
                {isActive ? (
                  <span className="ml-auto shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-small font-semibold text-accent">
                    Activo
                  </span>
                ) : null}
              </button>
              {isAdmin ? (
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    aria-label={`Editar ${w.name}`}
                    onClick={() => edit(w)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 text-destructive hover:text-destructive"
                    aria-label={`Eliminar ${w.name}`}
                    disabled={remove.isPending}
                    onClick={() => void onDelete(w)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
