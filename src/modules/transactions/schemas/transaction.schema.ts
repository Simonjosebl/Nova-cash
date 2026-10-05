import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/constants/limits';

/**
 * Validación de movimientos (Cap. 6.10 / R-15). Solo gastos e ingresos (no hay transferencias).
 * - monto > 0, cuenta obligatoria (RB-014), categoría obligatoria (RB-015), fecha obligatoria.
 */
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.')
    .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
  accountId: z.string().min(1, 'Elige una cuenta.'),
  categoryId: z.string().min(1, 'Elige una categoría.'),
  description: z.string().max(120, 'Descripción demasiado larga.').optional(),
  date: z.string().min(1, 'Elige una fecha.'),
  notes: z.string().max(300, 'Nota demasiado larga.').optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
