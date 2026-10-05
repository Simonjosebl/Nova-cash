import { ROUTES } from '@/shared/constants/routes';

export interface INavItem {
  to: string;
  emoji: string;
  label: string;
  end?: boolean;
}

/** Secciones principales (Cap. 3.20 / 6.21): Bottom Tab en móvil, barra lateral en computador. */
export const PRIMARY_NAV: ReadonlyArray<INavItem> = [
  { to: ROUTES.home, emoji: '🏠', label: 'Inicio', end: true },
  { to: ROUTES.transactions, emoji: '💸', label: 'Movimientos' },
  { to: ROUTES.calendar, emoji: '📅', label: 'Calendario' },
  { to: ROUTES.reports, emoji: '📊', label: 'Reportes' },
  { to: ROUTES.profile, emoji: '👤', label: 'Perfil' },
];

/** Barra lateral: Perfil vive en la barra superior en computador (R-06). */
export const SIDEBAR_NAV: ReadonlyArray<INavItem> = PRIMARY_NAV.filter(
  (item) => item.to !== ROUTES.profile,
);

/** Sección "Gestión" de la barra lateral en computador (R-06). */
export const MANAGEMENT_NAV: ReadonlyArray<INavItem> = [
  { to: ROUTES.accounts, emoji: '🏦', label: 'Cuentas' },
  { to: ROUTES.categories, emoji: '🏷️', label: 'Categorías' },
  { to: ROUTES.budgets, emoji: '📊', label: 'Presupuestos' },
  { to: ROUTES.goals, emoji: '🎯', label: 'Metas' },
  { to: ROUTES.members, emoji: '👥', label: 'Colaboradores' },
];
