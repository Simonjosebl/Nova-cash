import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type {
  Account,
  AccountType,
  CreateAccountDTO,
  UpdateAccountDTO,
} from '../types/account.types';

const COLS =
  'id,workspace_id,name,emoji,type,currency,opening_balance,current_balance,color,position,is_archived';

interface AccountRow {
  id: string;
  workspace_id: string;
  name: string;
  emoji: string;
  type: AccountType;
  currency: string;
  opening_balance: number | string;
  current_balance: number | string;
  color: string | null;
  position: number;
  is_archived: boolean;
}

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    emoji: row.emoji,
    type: row.type,
    currency: row.currency,
    openingBalance: Number(row.opening_balance),
    currentBalance: Number(row.current_balance),
    color: row.color,
    position: row.position,
    isArchived: row.is_archived,
  };
}

export interface CreateAccountParams extends CreateAccountDTO {
  currency: string;
  position: number;
}

export interface IAccountRepository {
  list(workspaceId: string, archived: boolean): Promise<Account[]>;
  create(workspaceId: string, params: CreateAccountParams): Promise<Account>;
  update(id: string, dto: UpdateAccountDTO): Promise<Account>;
  setArchived(id: string, archived: boolean): Promise<void>;
  softDelete(id: string): Promise<void>;
  setPosition(id: string, position: number): Promise<void>;
}

export class AccountRepository implements IAccountRepository {
  async list(workspaceId: string, archived: boolean): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .eq('is_archived', archived)
      .order('position', { ascending: true });
    if (error) throw toAppError(error, 'No pudimos cargar las cuentas.');
    return ((data ?? []) as AccountRow[]).map(mapAccount);
  }

  async create(workspaceId: string, params: CreateAccountParams): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        workspace_id: workspaceId,
        name: params.name,
        emoji: params.emoji,
        type: params.type,
        currency: params.currency,
        opening_balance: params.openingBalance,
        current_balance: params.openingBalance,
        color: params.color ?? null,
        position: params.position,
      })
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear la cuenta.');
    return mapAccount(data as AccountRow);
  }

  async update(id: string, dto: UpdateAccountDTO): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(dto)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar la cuenta.');
    return mapAccount(data as AccountRow);
  }

  async setArchived(id: string, archived: boolean): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_archived: archived })
      .eq('id', id);
    if (error) throw toAppError(error, 'No pudimos archivar la cuenta.');
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw toAppError(error, 'No pudimos eliminar la cuenta.');
  }

  async setPosition(id: string, position: number): Promise<void> {
    const { error } = await supabase.from('accounts').update({ position }).eq('id', id);
    if (error) throw toAppError(error, 'No pudimos reordenar las cuentas.');
  }
}

export const accountRepository = new AccountRepository();
