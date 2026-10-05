import { Link } from 'react-router-dom';
import { Bell, UserRound } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { WorkspaceSwitcher } from '@/modules/workspace/components/WorkspaceSwitcher';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useNotifications } from '@/modules/notifications/hooks/useNotifications';
import { getGreeting } from '../utils/greeting';

/** Header del Dashboard (Cap. 3.16): saludo + selector de Workspace + notificaciones + perfil. */
export function DashboardHeader() {
  const { user } = useAuth();
  const { active } = useActiveWorkspace();
  const { data: notifications = [] } = useNotifications(active?.id ?? '');
  const unread = notifications.filter((n) => !n.read).length;
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <WorkspaceSwitcher />
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Notificaciones"
            className="lg:hidden"
          >
            <Link to={ROUTES.notifications} className="relative">
              <Bell />
              {unread > 0 ? (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Perfil" className="lg:hidden">
            <Link to={ROUTES.profile}>
              <UserRound />
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-h3 font-bold text-primary">
        {getGreeting()}, {firstName} 👋
      </p>
    </header>
  );
}
