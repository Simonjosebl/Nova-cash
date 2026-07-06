import type { AccountType } from '../types/account.types';

/** Tipos de cuenta del MVP (Cap. 4.8). investment/crypto quedan para versiones futuras. */
export const ACCOUNT_TYPES: ReadonlyArray<{
  value: AccountType;
  label: string;
  emoji: string;
}> = [
  { value: 'cash', label: 'Efectivo', emoji: '💵' },
  { value: 'bank', label: 'Banco', emoji: '🏦' },
  { value: 'debit_card', label: 'Tarjeta débito', emoji: '💳' },
  { value: 'credit_card', label: 'Tarjeta de crédito', emoji: '💳' },
  { value: 'savings', label: 'Ahorros', emoji: '💰' },
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Efectivo',
  bank: 'Banco',
  debit_card: 'Tarjeta débito',
  credit_card: 'Tarjeta de crédito',
  savings: 'Ahorros',
  investment: 'Inversión',
  crypto: 'Cripto',
};

export const ACCOUNT_EMOJIS = ['💵', '🏦', '💳', '💰', '🪙', '🐷', '📈', '✈️'];
