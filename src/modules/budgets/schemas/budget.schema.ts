import { z } from 'zod';
import { MAX_AMOUNT } from '@/shared/constants/limits';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría.'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Elige una moneda.'),
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.')
    .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
  warningPercentage: z
    .number()
    .int()
    .min(1, 'Indica un porcentaje entre 1 y 100.')
    .max(100, 'Indica un porcentaje entre 1 y 100.')
    .default(80),
});

export const updateBudgetSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/, 'Elige una moneda.'),
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.')
    .max(MAX_AMOUNT, 'El monto es demasiado alto.'),
  warningPercentage: z
    .number()
    .int()
    .min(1, 'Indica un porcentaje entre 1 y 100.')
    .max(100, 'Indica un porcentaje entre 1 y 100.'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
