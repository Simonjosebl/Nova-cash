import { z } from 'zod';

const workspaceType = z.enum(['personal', 'couple', 'family', 'trip', 'project']);
const memberRole = z.enum(['admin', 'editor', 'viewer']);

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: workspaceType,
  currency: z.string().min(3, 'Elige una moneda.'),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: workspaceType,
  currency: z.string().min(3, 'Elige una moneda.'),
});

export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Correo no válido.'),
});

export const workspaceSettingsSchema = z.object({
  firstDayOfWeek: z.number().int().min(0).max(6),
  notificationsEnabled: z.boolean(),
  insightsEnabled: z.boolean(),
});

export { memberRole, workspaceType };

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type WorkspaceSettingsInput = z.infer<typeof workspaceSettingsSchema>;
