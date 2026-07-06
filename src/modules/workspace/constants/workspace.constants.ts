import type { MemberRole, WorkspaceType } from '../types/workspace.types';

/** Máximo de colaboradores en el MVP (Cap. 4.3 / RB-003). Admin no cuenta como límite estricto de invitación. */
export const MAX_MEMBERS = 5;

/** Tipos de Workspace con su emoji e identidad (Cap. 6.5 / 4.3). */
export const WORKSPACE_TYPES: ReadonlyArray<{
  value: WorkspaceType;
  label: string;
  emoji: string;
}> = [
  { value: 'personal', label: 'Personal', emoji: '👤' },
  { value: 'couple', label: 'Pareja', emoji: '❤️' },
  { value: 'family', label: 'Familia', emoji: '🏠' },
  { value: 'trip', label: 'Viaje', emoji: '✈️' },
  { value: 'project', label: 'Proyecto', emoji: '💼' },
];

/** Roles y su etiqueta humana (Cap. 4.6). */
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Lector',
};

/** Monedas soportadas en el MVP (mercado LatAm — Cap. 1). */
export const CURRENCIES: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'COP', label: 'Peso colombiano (COP)' },
  { code: 'USD', label: 'Dólar (USD)' },
  { code: 'MXN', label: 'Peso mexicano (MXN)' },
  { code: 'ARS', label: 'Peso argentino (ARS)' },
  { code: 'CLP', label: 'Peso chileno (CLP)' },
  { code: 'PEN', label: 'Sol peruano (PEN)' },
  { code: 'EUR', label: 'Euro (EUR)' },
];

/** Emojis sugeridos para el selector rápido (Cap. 3.13 — emojis como identidad). */
export const SUGGESTED_EMOJIS = [
  '👤',
  '❤️',
  '🏠',
  '✈️',
  '💼',
  '💰',
  '🎯',
  '🐶',
  '🎓',
  '🚀',
  '🌱',
  '⭐',
];
