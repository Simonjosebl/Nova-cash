import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/constants/limits';

/** Evento del calendario (Cap. 4.13 / 6.11): un pago/ingreso programado. */
export const eventSchema = z
  .object({
    title: z.string().min(2, 'Ingresa un nombre.').max(60, 'Nombre demasiado largo.'),
    emoji: z.string().min(1, 'Elige un emoji.'),
    flow: z.enum(['income', 'expense']),
    amount: z
      .number({ invalid_type_error: 'Ingresa un monto.' })
      .positive('El monto debe ser mayor a cero.')
      .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
    accountId: z.string().optional(),
    categoryId: z.string().optional(),
    date: z.string().min(1, 'Elige una fecha.'),
    notes: z.string().max(300, 'Nota demasiado larga.').optional(),
    repeatMonthly: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (!value.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Elige una categoría.',
      });
    }
  });

export type EventInput = z.infer<typeof eventSchema>;
