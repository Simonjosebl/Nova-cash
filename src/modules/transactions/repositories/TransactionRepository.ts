import { supabase } from '@/lib/supabase';
import { MAX_SEARCH_LENGTH } from '@/shared/constants/limits';
import { toAppError } from '@/shared/types/db-error';
import { PAGE_SIZE } from '../constants/transaction.constants';
import type {
  CreateTransactionDTO,
  Transaction,
  TransactionFilters,
  TransactionStatus,
  TransactionType,
  UpdateTransactionDTO,
} from '../types/transaction.types';

const SELECT =
  'id,workspace_id,account_id,to_account_id,category_id,type,amount,description,transaction_date,status,notes,' +
  'category:categories(name,emoji), account:accounts!account_id(name,emoji)';

interface Ref {
  name: string;
  emoji: string;
}
interface TransactionRow {
  id: string;
  workspace_id: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number | string;
  description: string | null;
  transaction_date: string;
  status: TransactionStatus;
  notes: string | null;
  category: Ref | Ref[] | null;
  account: Ref | Ref[] | null;
}

function one(ref: Ref | Ref[] | null): Ref | null {
  return Array.isArray(ref) ? (ref[0] ?? null) : ref;
}

function mapTransaction(row: TransactionRow): Transaction {
  const category = one(row.category);
  const account = one(row.account);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    accountId: row.account_id,
    toAccountId: row.to_account_id,
    categoryId: row.category_id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    date: row.transaction_date,
    status: row.status,
    notes: row.notes,
    categoryName: category?.name ?? null,
    categoryEmoji: category?.emoji ?? null,
    accountName: account?.name ?? null,
    accountEmoji: account?.emoji ?? null,
  };
}

export interface ITransactionRepository {
  list(workspaceId: string, filters: TransactionFilters): Promise<Transaction[]>;
  create(workspaceId: string, dto: CreateTransactionDTO): Promise<Transaction>;
  update(id: string, dto: UpdateTransactionDTO): Promise<Transaction>;
  softDelete(id: string): Promise<void>;
}

export class TransactionRepository implements ITransactionRepository {
  async list(workspaceId: string, filters: TransactionFilters): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(SELECT)
      .eq('workspace_id', workspaceId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.accountId) query = query.eq('account_id', filters.accountId);
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters.dateFrom) query = query.gte('transaction_date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('transaction_date', filters.dateTo);
    if (filters.search) {
      // Escapa comodines de LIKE para que el texto se busque literal (R-18).
      const term = filters.search.slice(0, MAX_SEARCH_LENGTH).replace(/[%_\\]/g, (c) => `\\${c}`);
      query = query.ilike('description', `%${term}%`);
    }

    const limit = filters.limit ?? PAGE_SIZE;
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw toAppError(error, 'No pudimos cargar los movimientos.');
    return ((data ?? []) as unknown as TransactionRow[]).map(mapTransaction);
  }

  async create(workspaceId: string, dto: CreateTransactionDTO): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        workspace_id: workspaceId,
        account_id: dto.accountId,
        to_account_id: dto.toAccountId ?? null,
        category_id: dto.categoryId ?? null,
        type: dto.type,
        amount: dto.amount,
        description: dto.description ?? null,
        transaction_date: dto.date,
        notes: dto.notes ?? null,
      })
      .select(SELECT)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos registrar el movimiento.');
    return mapTransaction(data as unknown as TransactionRow);
  }

  async update(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    const patch: Record<string, unknown> = {};
    if (dto.accountId !== undefined) patch.account_id = dto.accountId;
    if (dto.toAccountId !== undefined) patch.to_account_id = dto.toAccountId;
    if (dto.categoryId !== undefined) patch.category_id = dto.categoryId;
    if (dto.type !== undefined) patch.type = dto.type;
    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.date !== undefined) patch.transaction_date = dto.date;
    if (dto.notes !== undefined) patch.notes = dto.notes;

    const { data, error } = await supabase
      .from('transactions')
      .update(patch)
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar el movimiento.');
    return mapTransaction(data as unknown as TransactionRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_record', {
      p_table: 'transactions',
      p_id: id,
    });
    if (error) throw toAppError(error, 'No pudimos eliminar el movimiento.');
  }
}

export const transactionRepository = new TransactionRepository();
