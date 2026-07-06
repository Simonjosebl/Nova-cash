import { describe, it, expect } from 'vitest';
import { addMonthsIso, daysUntil, formatDateLabel, todayIso } from './date';

describe('todayIso', () => {
  it('formatea la fecha local', () => {
    expect(todayIso(new Date(2026, 6, 5))).toBe('2026-07-05');
  });
});

describe('addMonthsIso', () => {
  it('suma un mes conservando el día', () => {
    expect(addMonthsIso('2026-07-15', 1)).toBe('2026-08-15');
  });
  it('normaliza el desbordamiento de día', () => {
    // 31 de enero + 1 mes → marzo (febrero no tiene 31)
    expect(addMonthsIso('2026-01-31', 1)).toBe('2026-03-03');
  });
});

describe('daysUntil', () => {
  it('calcula días hacia una fecha futura', () => {
    expect(daysUntil('2026-07-10', new Date('2026-07-05T12:00:00'))).toBe(5);
  });
  it('es 0 para hoy', () => {
    expect(daysUntil('2026-07-05', new Date('2026-07-05T09:00:00'))).toBe(0);
  });
});

describe('formatDateLabel', () => {
  it('reconoce hoy y ayer', () => {
    const now = new Date('2026-07-05T10:00:00');
    expect(formatDateLabel('2026-07-05', now)).toBe('Hoy');
    expect(formatDateLabel('2026-07-04', now)).toBe('Ayer');
  });
});
