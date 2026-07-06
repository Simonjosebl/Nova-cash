import { describe, it, expect } from 'vitest';
import { goalSchema, contributionSchema } from '../schemas/goal.schema';

describe('goalSchema', () => {
  const base = { name: 'Japón', emoji: '✈️', targetAmount: 8000000 };

  it('acepta una meta válida', () => {
    expect(goalSchema.safeParse(base).success).toBe(true);
  });
  it('rechaza meta no positiva', () => {
    expect(goalSchema.safeParse({ ...base, targetAmount: 0 }).success).toBe(false);
  });
  it('rechaza nombre corto', () => {
    expect(goalSchema.safeParse({ ...base, name: 'J' }).success).toBe(false);
  });
});

describe('contributionSchema', () => {
  it('exige monto positivo', () => {
    expect(contributionSchema.safeParse({ amount: 100 }).success).toBe(true);
    expect(contributionSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});
