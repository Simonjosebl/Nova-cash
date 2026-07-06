import { describe, it, expect } from 'vitest';
import { eventSchema } from '../schemas/calendar.schema';

const base = {
  title: 'Arriendo',
  emoji: '🏠',
  flow: 'expense' as const,
  amount: 1200000,
  categoryId: 'cat1',
  date: '2026-07-05',
  repeatMonthly: false,
};

describe('eventSchema', () => {
  it('acepta un evento válido', () => {
    expect(eventSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza monto cero', () => {
    expect(eventSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
  });

  it('exige categoría', () => {
    expect(eventSchema.safeParse({ ...base, categoryId: undefined }).success).toBe(false);
  });

  it('rechaza título corto', () => {
    expect(eventSchema.safeParse({ ...base, title: 'A' }).success).toBe(false);
  });
});
