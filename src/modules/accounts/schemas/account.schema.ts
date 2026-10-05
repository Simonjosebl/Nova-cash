import { z } from 'zod';

const accountType = z.enum([
  'cash',
  'bank',
  'credit_card',
  'debit_card',
  'savings',
  'investment',
  'crypto',
]);

export const createAccountSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: accountType,
  currency: z.string().regex(/^[A-Z]{3}$/, 'Elige una moneda.'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: accountType,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
