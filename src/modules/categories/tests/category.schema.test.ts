import { describe, it, expect } from 'vitest';
import { createCategorySchema } from '../schemas/category.schema';

describe('createCategorySchema', () => {
  const base = { name: 'Comida', emoji: '🍔', type: 'expense' as const };

  it('acepta una categoría válida', () => {
    expect(createCategorySchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre corto', () => {
    expect(createCategorySchema.safeParse({ ...base, name: 'C' }).success).toBe(false);
  });

  it('rechaza emoji vacío', () => {
    expect(createCategorySchema.safeParse({ ...base, emoji: '' }).success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    expect(
      createCategorySchema.safeParse({ ...base, type: 'transfer' as unknown as 'expense' }).success,
    ).toBe(false);
  });
});
