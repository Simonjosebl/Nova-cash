import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '../hooks/useWorkspaces';
import { useAuditLog } from '../hooks/useAuditLog';

/** Historial colaborativo (Cap. 4.18 / 6.15): quién hizo qué y cuándo. Solo admin. */
export function HistoryPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const isAdmin = active?.role === 'admin';
  const { data: entries = [], isLoading } = useAuditLog(workspaceId);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Historial</h1>
      </header>

      {!isAdmin ? (
        <EmptyState
          emoji="🔒"
          title="Solo para administradores"
          description="El historial de actividad está disponible para los administradores del espacio."
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          emoji="🧾"
          title="Sin actividad todavía"
          description="Aquí verás lo que ocurre en el espacio."
        />
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-body">
                {e.userName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body text-foreground">
                  <span className="font-medium">{e.userName}</span> {e.description}
                </p>
                <p className="text-caption text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </main>
  );
}
