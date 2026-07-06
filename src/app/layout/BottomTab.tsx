import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';

/** Bottom Tab (Cap. 3.20 / 6.21): cinco pestañas con emojis de identidad. */
const TABS: ReadonlyArray<{ to: string; emoji: string; label: string; end?: boolean }> = [
  { to: ROUTES.home, emoji: '🏠', label: 'Inicio', end: true },
  { to: ROUTES.transactions, emoji: '💸', label: 'Movimientos' },
  { to: ROUTES.calendar, emoji: '📅', label: 'Calendario' },
  { to: ROUTES.reports, emoji: '📊', label: 'Reportes' },
  { to: ROUTES.profile, emoji: '👤', label: 'Perfil' },
];

export function BottomTab() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 text-small transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
