/** Rutas de la aplicación. Fuente única para navegación y guards. */
export const ROUTES = {
  // Públicas (auth)
  login: '/login',
  register: '/register',
  magicLink: '/magic-link',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  // Privadas
  home: '/',
  transactions: '/transactions',
  calendar: '/calendar',
  reports: '/reports',
  profile: '/profile',
  accounts: '/accounts',
  categories: '/categories',
  budgets: '/budgets',
  goals: '/goals',
  notifications: '/notifications',
  createWorkspace: '/workspace/new',
  workspaceSettings: '/workspace/settings',
  members: '/workspace/members',
  history: '/workspace/history',
  invite: '/invite',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
