export type AccountType =
  'cash' | 'bank' | 'credit_card' | 'debit_card' | 'savings' | 'investment' | 'crypto';

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  emoji: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  color: string | null;
  position: number;
  isArchived: boolean;
}

export interface CreateAccountDTO {
  name: string;
  emoji: string;
  type: AccountType;
  openingBalance: number;
  color?: string | null;
}

export interface UpdateAccountDTO {
  name?: string;
  emoji?: string;
  type?: AccountType;
  color?: string | null;
}
