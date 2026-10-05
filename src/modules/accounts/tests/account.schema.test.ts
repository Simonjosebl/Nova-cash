import { describe, it, expect } from 'vitest';
import { createAccountSchema } from '../schemas/account.schema';

describe('createAccountSchema', () => {
  const base = { name: 'Banco', emoji: '🏦', type: 'bank' as const, currency: 'COP' };

  it('acepta una cuenta válida', () => {
    expect(createAccountSchema.safeParse(base).success).toBe(true);
  });

  it('exige una moneda ISO válida', () => {
    expect(createAccountSchema.safeParse({ ...base, currency: 'pesos' }).success).toBe(false);
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
