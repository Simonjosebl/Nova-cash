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
  openingBalance: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .min(0, 'El saldo no puede ser negativo.'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: accountType,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
