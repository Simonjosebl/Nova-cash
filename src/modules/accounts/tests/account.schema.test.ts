import { describe, it, expect } from 'vitest';
import { createAccountSchema } from '../schemas/account.schema';

describe('createAccountSchema', () => {
  const base = { name: 'Banco', emoji: '🏦', type: 'bank' as const, openingBalance: 100 };

  it('acepta una cuenta válida', () => {
    expect(createAccountSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza saldo negativo', () => {
    expect(createAccountSchema.safeParse({ ...base, openingBalance: -1 }).success).toBe(false);
  });

  it('rechaza nombre corto', () => {
    expect(createAccountSchema.safeParse({ ...base, name: 'B' }).success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    expect(
      createAccountSchema.safeParse({ ...base, type: 'bitcoin' as unknown as 'bank' }).success,
    ).toBe(false);
  });
});
