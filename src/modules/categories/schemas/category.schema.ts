import { z } from 'zod';

const categoryType = z.enum(['income', 'expense']);

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre.').max(40, 'Nombre demasiado largo.'),
  emoji: z.string().min(1, 'Elige un emoji.'),
  type: categoryType,
});

export const updateCategorySchema = createCategorySchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
