import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría.'),
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.'),
  warningPercentage: z.number().int().min(1).max(100).default(80),
});

export const updateBudgetSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto.' })
    .positive('El monto debe ser mayor a cero.'),
  warningPercentage: z.number().int().min(1).max(100),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
