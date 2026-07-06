import { describe, it, expect } from 'vitest';
import { formatMoney, toPercent } from './money';

describe('formatMoney', () => {
  it('formatea COP sin decimales', () => {
    const out = formatMoney(1400000, 'COP');
    expect(out).toContain('1.400.000');
  });
  it('tolera monedas no estándar con fallback', () => {
    expect(formatMoney(1000, 'XYZ')).toContain('XYZ');
  });
});

describe('toPercent', () => {
  it('calcula porcentaje entero', () => {
    expect(toPercent(50, 200)).toBe(25);
  });
  it('devuelve 0 si el total es 0', () => {
    expect(toPercent(10, 0)).toBe(0);
  });
});
