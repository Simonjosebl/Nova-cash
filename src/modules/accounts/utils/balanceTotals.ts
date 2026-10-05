import type { Account } from '../types/account.types';

export interface ICurrencyTotal {
  currency: string;
  total: number;
}

/**
 * Saldo por moneda (R-08: no se mezclan ni se convierten). La moneda principal va primero
 * aunque no tenga cuentas; las demás, en el orden en que aparecen.
 */
export function balanceTotals(accounts: ReadonlyArray<Account>, primary: string): ICurrencyTotal[] {
  const totals = new Map<string, number>([[primary, 0]]);
  for (const account of accounts) {
    totals.set(account.currency, (totals.get(account.currency) ?? 0) + account.currentBalance);
  }
  return [...totals].map(([currency, total]) => ({ currency, total }));
}
