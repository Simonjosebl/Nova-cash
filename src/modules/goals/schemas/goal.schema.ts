import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/constants/limits';

export const goalSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  targetAmount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('La meta debe ser mayor a cero.')
    .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
  targetDate: z.string().optional(),
});

export const contributionSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.')
    .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
