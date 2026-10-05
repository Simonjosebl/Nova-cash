import { describe, it, expect } from 'vitest';
import { transactionSchema } from '../schemas/transaction.schema';

const expense = {
  type: 'expense' as const,
  amount: 1000,
  accountId: 'acc1',
  categoryId: 'cat1',
  date: '2026-07-05',
};

describe('transactionSchema', () => {
  it('acepta un gasto válido con categoría', () => {
    expect(transactionSchema.safeParse(expense).success).toBe(true);
  });

  it('rechaza monto cero o negativo', () => {
    expect(transactionSchema.safeParse({ ...expense, amount: 0 }).success).toBe(false);
  });

  it('exige categoría en gasto/ingreso (RB-015)', () => {
    expect(transactionSchema.safeParse({ ...expense, categoryId: undefined }).success).toBe(false);
  });

  it('exige cuenta (RB-014)', () => {
    expect(transactionSchema.safeParse({ ...expense, accountId: '' }).success).toBe(false);
  });

  it('no admite transferencias (R-15)', () => {
    expect(transactionSchema.safeParse({ ...expense, type: 'transfer' }).success).toBe(false);
  });
});
