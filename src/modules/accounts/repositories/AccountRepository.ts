import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type {
  Account,
  AccountType,
  CreateAccountDTO,
  UpdateAccountDTO,
} from '../types/account.types';

const COLS = 'id,workspace_id,name,emoji,type,currency,current_balance,color,position';

interface AccountRow {
  id: string;
  workspace_id: string;
  name: string;
  emoji: string;
  type: AccountType;
  currency: string;
  current_balance: number | string;
  color: string | null;
  position: number;
}

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    emoji: row.emoji,
    type: row.type,
    currency: row.currency,
    currentBalance: Number(row.current_balance),
    color: row.color,
    position: row.position,
  };
}

export interface CreateAccountParams extends CreateAccountDTO {
  position: number;
}

export interface IAccountRepository {
  list(workspaceId: string): Promise<Account[]>;
  create(workspaceId: string, params: CreateAccountParams): Promise<Account>;
  update(id: string, dto: UpdateAccountDTO): Promise<Account>;
  softDelete(id: string): Promise<void>;
}

export class AccountRepository implements IAccountRepository {
  async list(workspaceId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select(COLS)
      .eq('workspace_id', workspaceId)
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

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_record', { p_table: 'accounts', p_id: id });
    if (error) throw toAppError(error, 'No pudimos eliminar la cuenta.');
  }
}

export const accountRepository = new AccountRepository();
