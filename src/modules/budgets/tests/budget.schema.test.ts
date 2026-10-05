import { describe, it, expect } from 'vitest';
import { createBudgetSchema } from '../schemas/budget.schema';

const base = { categoryId: 'c1', amount: 500000, currency: 'COP', warningPercentage: 80 };

describe('createBudgetSchema', () => {
  it('acepta un presupuesto válido', () => {
    expect(createBudgetSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza monto no positivo', () => {
    expect(createBudgetSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
  });

  it('exige categoría', () => {
    expect(createBudgetSchema.safeParse({ ...base, categoryId: '' }).success).toBe(false);
  });

  it('exige una moneda ISO válida', () => {
    expect(createBudgetSchema.safeParse({ ...base, currency: 'pesos' }).success).toBe(false);
  });

  it('rechaza umbral fuera de rango', () => {
    expect(createBudgetSchema.safeParse({ ...base, warningPercentage: 150 }).success).toBe(false);
  });
});
