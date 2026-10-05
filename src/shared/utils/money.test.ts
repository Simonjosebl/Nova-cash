import { describe, it, expect } from 'vitest';
import { formatAmountInput, formatMoney, parseAmountInput, toPercent } from './money';

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

describe('formatAmountInput', () => {
  it('agrupa miles con punto', () => {
    expect(formatAmountInput(1250000)).toBe('1.250.000');
  });
  it('deja vacío el cero para que no quede fijo', () => {
    expect(formatAmountInput(0)).toBe('');
  });
});

describe('parseAmountInput', () => {
  it('ignora puntos y símbolos', () => {
    expect(parseAmountInput('1.250.000')).toBe(1250000);
    expect(parseAmountInput('$ 3.500')).toBe(3500);
  });
  it('quita ceros a la izquierda y trata vacío como 0', () => {
    expect(parseAmountInput('011')).toBe(11);
    expect(parseAmountInput('')).toBe(0);
  });
});
