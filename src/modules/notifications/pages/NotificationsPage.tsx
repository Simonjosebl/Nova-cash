import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useNotifications } from '../hooks/useNotifications';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../hooks/useNotificationMutations';
import { NOTIFICATION_EMOJI } from '../constants/notification.constants';

/** Centro de notificaciones in-app (Cap. 6.19). */
export function NotificationsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';

  const { data: notifications = [], isLoading } = useNotifications(workspaceId);
  const markRead = useMarkNotificationRead(workspaceId);
  const markAll = useMarkAllNotificationsRead(workspaceId);
  const remove = useDeleteNotification(workspaceId);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="flex-1 text-h3 font-bold text-primary">Notificaciones</h1>
        {hasUnread ? (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="text-caption text-nova-blue"
          >
            Marcar todo leído
          </button>
        ) : null}
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="Sin notificaciones"
          description="Te avisaremos de pagos, presupuestos y metas."
        />
      ) : (
        <section className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'flex items-start gap-3 p-4',
                !n.read && 'border-l-4 border-l-nova-blue',
              )}
              onClick={() => !n.read && markRead.mutate(n.id)}
            >
              <span className="text-xl">{NOTIFICATION_EMOJI[n.priority]}</span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-body text-foreground', !n.read && 'font-semibold')}>
                  {n.title}
                </p>
                <p className="text-caption text-muted-foreground">{n.message}</p>
              </div>
              <button
                type="button"
                aria-label="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  remove.mutate(n.id);
                }}
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
