import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type { Budget, BudgetPeriod, CreateBudgetDTO, UpdateBudgetDTO } from '../types/budget.types';
import { spentKey } from '../utils/spentKey';

const COLS =
  'id,workspace_id,category_id,amount,currency,period,warning_percentage, category:categories(name,emoji)';

interface Ref {
  name: string;
  emoji: string;
}
interface BudgetRow {
  id: string;
  workspace_id: string;
  category_id: string;
  amount: number | string;
  currency: string;
  period: BudgetPeriod;
  warning_percentage: number;
  category: Ref | Ref[] | null;
}

interface SpentRow {
  category_id: string | null;
  amount: number | string;
  account: { currency: string } | Array<{ currency: string }> | null;
}

function mapBudget(row: BudgetRow): Budget {
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    categoryId: row.category_id,
    amount: Number(row.amount),
    currency: row.currency,
    period: row.period,
    warningPercentage: row.warning_percentage,
    categoryName: category?.name ?? '',
    categoryEmoji: category?.emoji ?? '🏷️',
  };
}

export interface IBudgetRepository {
  list(workspaceId: string): Promise<Budget[]>;
  /** Gasto del periodo agrupado por categoría y moneda de la cuenta (clave spentKey). */
  spentByCategory(workspaceId: string, from: string, to: string): Promise<Map<string, number>>;
  create(workspaceId: string, dto: CreateBudgetDTO): Promise<Budget>;
  update(id: string, dto: UpdateBudgetDTO): Promise<Budget>;
  softDelete(id: string): Promise<void>;
}

export class BudgetRepository implements IBudgetRepository {
  async list(workspaceId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(COLS)
      .eq('workspace_id', workspaceId);
    if (error) throw toAppError(error, 'No pudimos cargar los presupuestos.');
    return ((data ?? []) as unknown as BudgetRow[]).map(mapBudget);
  }

  async spentByCategory(
    workspaceId: string,
    from: string,
    to: string,
  ): Promise<Map<string, number>> {
    const { data, error } = await supabase
      .from('transactions')
      .select('category_id,amount, account:accounts!transactions_account_id_fkey(currency)')
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .eq('status', 'confirmed')
      .gte('transaction_date', from)
      .lte('transaction_date', to);
    if (error) throw toAppError(error, 'No pudimos calcular el gasto.');

    const map = new Map<string, number>();
    for (const row of (data ?? []) as unknown as SpentRow[]) {
      const account = Array.isArray(row.account) ? row.account[0] : row.account;
      if (!row.category_id || !account) continue;
      const key = spentKey(row.category_id, account.currency);
      map.set(key, (map.get(key) ?? 0) + Number(row.amount));
    }
    return map;
  }

  async create(workspaceId: string, dto: CreateBudgetDTO): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        workspace_id: workspaceId,
        category_id: dto.categoryId,
        amount: dto.amount,
        currency: dto.currency,
        warning_percentage: dto.warningPercentage,
      })
      .select(COLS)
      .single();
    if (error || !data) {
      throw toAppError(error, 'No pudimos crear el presupuesto.');
    }
    return mapBudget(data as unknown as BudgetRow);
  }

  async update(id: string, dto: UpdateBudgetDTO): Promise<Budget> {
    const patch: Record<string, unknown> = {};
    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.currency !== undefined) patch.currency = dto.currency;
    if (dto.warningPercentage !== undefined) patch.warning_percentage = dto.warningPercentage;

    const { data, error } = await supabase
      .from('budgets')
      .update(patch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar el presupuesto.');
    return mapBudget(data as unknown as BudgetRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_record', { p_table: 'budgets', p_id: id });
    if (error) throw toAppError(error, 'No pudimos eliminar el presupuesto.');
  }
}

export const budgetRepository = new BudgetRepository();
