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

/** Todo colaborador invitado entra como editor (R-11). El administrador es el propietario. */
export const COLLABORATOR_ROLE = 'editor' as const;
