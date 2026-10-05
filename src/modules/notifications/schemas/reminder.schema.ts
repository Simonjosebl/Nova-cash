import { z } from 'zod';

const isoWeekday = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

/** Recordatorio (R-13): qué, a qué hora y qué días. */
export const reminderSchema = z.object({
  kind: z.enum(['expense', 'income', 'any']),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Elige una hora.'),
  days: z.array(isoWeekday).min(1, 'Elige al menos un día.'),
  enabled: z.boolean(),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
