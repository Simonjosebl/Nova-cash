import { describe, expect, it } from 'vitest';
import { CURRENCY_CODES } from '@/shared/constants/currencies';
import { getAllCurrencies, getCurrencyInfo, searchCurrencies } from './currency';

describe('getCurrencyInfo', () => {
  it('da nombre en español, símbolo y bandera del país', () => {
    const cop = getCurrencyInfo('COP');
    expect(cop.flag).toBe('co');
    expect(cop.name.toLowerCase()).toContain('peso colombiano');
    expect(cop.symbol).toBe('$');
  });

  it('usa la bandera regional para monedas compartidas', () => {
    expect(getCurrencyInfo('EUR').flag).toBe('eu');
    expect(getCurrencyInfo('XOF').flag).toBe('sn');
  });
});

describe('catálogo de monedas', () => {
  it('incluye todas las monedas vigentes sin duplicados', () => {
    const all = getAllCurrencies();
    expect(all).toHaveLength(CURRENCY_CODES.length);
    expect(new Set(all.map((c) => c.code)).size).toBe(all.length);
    expect(all.length).toBeGreaterThan(150);
  });

  it('busca por código o por nombre sin tildes', () => {
    const all = getAllCurrencies();
    expect(searchCurrencies(all, 'usd').map((c) => c.code)).toContain('USD');
    expect(searchCurrencies(all, 'yen').map((c) => c.code)).toContain('JPY');
    expect(searchCurrencies(all, 'dolar').some((c) => c.code === 'USD')).toBe(true);
    expect(searchCurrencies(all, 'japon').map((c) => c.code)).toContain('JPY');
  });
});
