import { NavLink } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { Avatar } from '@/shared/ui/avatar';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useNotifications } from '@/modules/notifications/hooks/useNotifications';

const iconButton = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex size-11 items-center justify-center rounded-full border transition-colors',
    isActive
      ? 'border-accent/40 bg-accent/10 text-foreground'
      : 'border-transparent bg-card text-muted-foreground shadow-card-glow hover:text-foreground dark:shadow-card-glow-dark',
  );

/**
 * Barra superior de computador (R-06): Notificaciones, Configuración y Perfil como botones
 * redondos solo con ícono, arriba a la derecha.
 */
export function TopBar() {
  const { user } = useAuth();
  const { active } = useActiveWorkspace();
  const { data: notifications = [] } = useNotifications(active?.id ?? '');
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="hidden justify-end gap-2 px-10 pt-6 lg:flex">
      <NavLink
        to={ROUTES.notifications}
        className={iconButton}
        aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
        title="Notificaciones"
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </NavLink>
      <NavLink
        to={ROUTES.workspaceSettings}
        className={iconButton}
        aria-label="Configuración"
        title="Configuración"
      >
        <Settings className="size-5" />
      </NavLink>
      <NavLink
        to={ROUTES.profile}
        className={iconButton}
        aria-label="Perfil"
        title={user?.name || 'Perfil'}
      >
        <Avatar name={user?.name ?? ''} src={user?.avatarUrl} className="size-8" />
      </NavLink>
    </div>
  );
}
