import { describe, expect, it } from 'vitest';
import { describeDays } from '../utils/reminderSchedule';
import { reminderSchema } from '../schemas/reminder.schema';

describe('describeDays', () => {
  it('nombra los patrones comunes', () => {
    expect(describeDays([1, 2, 3, 4, 5, 6, 7])).toBe('Todos los días');
    expect(describeDays([1, 2, 3, 4, 5])).toBe('Entre semana');
    expect(describeDays([6, 7])).toBe('Fines de semana');
  });

  it('lista días sueltos en orden de semana', () => {
    expect(describeDays([5, 1, 3])).toBe('Lun, Mié, Vie');
  });
});

describe('reminderSchema', () => {
  const base = { kind: 'any' as const, time: '20:00', days: [1, 2] as Array<1 | 2>, enabled: true };

  it('acepta un recordatorio válido', () => {
    expect(reminderSchema.safeParse(base).success).toBe(true);
  });

  it('exige al menos un día y una hora válida', () => {
    expect(reminderSchema.safeParse({ ...base, days: [] }).success).toBe(false);
    expect(reminderSchema.safeParse({ ...base, time: '25:00' }).success).toBe(false);
  });
});
