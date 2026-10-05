import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoMark from '@/shared/assets/logo-mark.png';
import { ThemeSwitch } from '@/shared/ui/theme-switch';
import { MANAGEMENT_NAV, SIDEBAR_NAV, type INavItem } from './navigation';

function SidebarLink({ item }: { item: INavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-sm px-3 py-2.5 text-caption transition-colors',
          isActive
            ? 'bg-secondary font-semibold text-foreground'
            : 'font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
        )
      }
    >
      <span className="text-lg leading-none">{item.emoji}</span>
      {item.label}
    </NavLink>
  );
}

/** Barra lateral de computador (R-06): reemplaza al Bottom Tab y al FAB desde 1024 px. */
export function Sidebar({ onAdd }: { onAdd: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden bg-card shadow-panel dark:shadow-panel-dark lg:flex">
      {/* Resplandor de marca en los tonos de la N (cyan → verde), detrás del contenido. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -left-16 -top-16 size-64 rounded-full bg-nova-cyan/35 blur-3xl dark:bg-nova-cyan/25" />
        <span className="absolute left-2 top-4 size-32 rounded-full bg-nova-green/25 blur-2xl dark:bg-nova-green/15" />
        <span className="absolute -bottom-20 -right-20 size-64 rounded-full bg-nova-blue/25 blur-3xl dark:bg-nova-blue/20" />
        <span className="absolute -bottom-10 right-0 size-32 rounded-full bg-nova-cyan/25 blur-2xl dark:bg-nova-cyan/15" />
        {/* Borde luminoso sutil en el verde azulado de la N; se desvanece en los extremos. */}
        <span className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-transparent via-nova-green/15 to-nova-cyan/15 blur-md" />
        <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-nova-green/60 to-nova-cyan/50" />
      </div>
      <div className="relative flex items-center gap-3 px-6 pb-6 pt-8">
        <img src={logoMark} alt="" className="h-8 w-auto" />
        <span className="text-h3 font-bold leading-8 tracking-tight text-primary">NovaCash</span>
      </div>

      <div className="relative px-4">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-nova-blue to-nova-cyan text-caption font-semibold text-white shadow-card transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <Plus className="size-5" />
          Registrar movimiento
        </button>
      </div>

      <nav
        aria-label="Navegación principal"
        className="relative flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 [scrollbar-width:none] hover:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden hover:[&::-webkit-scrollbar]:block"
      >
        <div className="flex flex-col gap-1">
          {SIDEBAR_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-small font-semibold uppercase tracking-wide text-muted-foreground">
            Gestión
          </p>
          {MANAGEMENT_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </div>
      </nav>

      <div className="relative flex items-center justify-between border-t border-border px-6 py-4">
        <span className="text-caption font-medium text-muted-foreground">Modo oscuro</span>
        <ThemeSwitch />
      </div>
    </aside>
  );
}
