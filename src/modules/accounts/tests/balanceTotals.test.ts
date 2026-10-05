import { describe, expect, it } from 'vitest';
import { balanceTotals } from '../utils/balanceTotals';
import type { Account } from '../types/account.types';

const account = (currency: string, currentBalance: number): Account => ({
  id: `${currency}-${currentBalance}`,
  workspaceId: 'ws',
  name: 'Cuenta',
  emoji: '💵',
  type: 'cash',
  currency,
  currentBalance,
  color: null,
  position: 0,
});

describe('balanceTotals', () => {
  it('no mezcla monedas y pone primero la principal', () => {
    const result = balanceTotals(
      [account('USD', 50), account('COP', 1000), account('COP', -200)],
      'COP',
    );
    expect(result).toEqual([
      { currency: 'COP', total: 800 },
      { currency: 'USD', total: 50 },
    ]);
  });

  it('muestra la principal en 0 si no hay cuentas', () => {
    expect(balanceTotals([], 'COP')).toEqual([{ currency: 'COP', total: 0 }]);
  });
});
