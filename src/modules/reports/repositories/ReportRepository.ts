import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';

export interface ReportRow {
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number;
  month: string; // 'YYYY-MM'
  categoryName: string | null;
  categoryEmoji: string | null;
}

interface Ref {
  name: string;
  emoji: string;
}
interface RawRow {
  type: ReportRow['type'];
  amount: number | string;
  transaction_date: string;
  category: Ref | Ref[] | null;
}

export interface IReportRepository {
  fetchRange(workspaceId: string, from: string, to: string): Promise<ReportRow[]>;
}

export class ReportRepository implements IReportRepository {
  async fetchRange(workspaceId: string, from: string, to: string): Promise<ReportRow[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('type,amount,transaction_date, category:categories(name,emoji)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'confirmed')
      .gte('transaction_date', from)
      .lte('transaction_date', to);
    if (error) throw toAppError(error, 'No pudimos cargar el reporte.');

    return ((data ?? []) as unknown as RawRow[]).map((row) => {
      const cat = Array.isArray(row.category) ? row.category[0] : row.category;
      return {
        type: row.type,
        amount: Number(row.amount),
        month: row.transaction_date.slice(0, 7),
        categoryName: cat?.name ?? null,
        categoryEmoji: cat?.emoji ?? null,
      };
    });
  }
}

export const reportRepository = new ReportRepository();
