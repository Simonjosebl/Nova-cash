export type AccountType =
  'cash' | 'bank' | 'credit_card' | 'debit_card' | 'savings' | 'investment' | 'crypto';

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  emoji: string;
  type: AccountType;
  currency: string;
  currentBalance: number;
  color: string | null;
  position: number;
}

export interface CreateAccountDTO {
  name: string;
  emoji: string;
  type: AccountType;
  /** Moneda de la cuenta; por defecto la del espacio (R-08). */
  currency: string;
  color?: string | null;
}

export interface UpdateAccountDTO {
  name?: string;
  emoji?: string;
  type?: AccountType;
  color?: string | null;
}
