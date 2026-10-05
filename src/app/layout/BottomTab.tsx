import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV } from './navigation';

/** Bottom Tab (Cap. 3.20 / 6.21 / R-06): cinco columnas iguales, solo en móvil y tablet. */
export function BottomTab() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {PRIMARY_NAV.map((item) => (
          <li key={item.to} className="min-w-0">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'text-[22px] leading-none transition-transform',
                      isActive && 'scale-110',
                    )}
                  >
                    {item.emoji}
                  </span>
                  <span
                    className={cn(
                      'w-full truncate px-0.5 text-center text-[11px] leading-none',
                      isActive ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
