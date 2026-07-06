import { z } from 'zod';

/**
 * Validación de movimientos (Cap. 6.10). Reglas:
 * - monto > 0, cuenta obligatoria (RB-014), fecha obligatoria.
 * - transferencia: cuenta destino distinta, sin categoría (RB-007/015).
 * - ingreso/gasto: categoría obligatoria (RB-015).
 */
export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z
      .number({ invalid_type_error: 'Ingresa un monto.' })
      .positive('El monto debe ser mayor a cero.'),
    accountId: z.string().min(1, 'Elige una cuenta.'),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().max(120, 'Descripción demasiado larga.').optional(),
    date: z.string().min(1, 'Elige una fecha.'),
    notes: z.string().max(300, 'Nota demasiado larga.').optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'transfer') {
      if (!value.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Elige la cuenta destino.',
        });
      } else if (value.toAccountId === value.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Debe ser distinta a la cuenta de origen.',
        });
      }
    } else if (!value.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Elige una categoría.',
      });
    }
  });

export type TransactionInput = z.infer<typeof transactionSchema>;
