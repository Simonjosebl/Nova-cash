import { supabase } from '@/lib/supabase';
import { daysUntil } from '@/shared/utils/date';
import type {
  DashboardActivityItem,
  DashboardAggregates,
  DashboardBudget,
  DashboardCategory,
  DashboardGoal,
  DashboardUpcomingPayment,
} from '../types/dashboard.types';

/**
 * DashboardRepository — agregados del Workspace (Cap. 8 / 4.16).
 * Fase 6: saldo (cuentas) + resumen/categorías/actividad (transacciones del mes).
 * Las transferencias no afectan ingresos/gastos (RB-007). Presupuestos/metas se suman en Fases 8/9.
 * (A futuro conviene una función RPC en Postgres para hacerlo en una sola ida al servidor.)
 */
export interface IDashboardRepository {
  loadAggregates(workspaceId: string): Promise<DashboardAggregates>;
}

const TYPE_EMOJI: Record<string, string> = {
  income: '💰',
  expense: '💸',
  transfer: '🔄',
  adjustment: '⚙️',
};

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function monthBounds(now: Date) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const prev = new Date(y, m - 1, 1);
  return {
    monthStart: ymd(y, m, 1),
    monthEnd: ymd(y, m, new Date(y, m + 1, 0).getDate()),
    prevStart: ymd(prev.getFullYear(), prev.getMonth(), 1),
    prevEnd: ymd(prev.getFullYear(), prev.getMonth() + 1, 0),
  };
}

function daysSince(dateStr: string, now: Date): number {
  const d = new Date(`${dateStr}T00:00:00`);
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((t.getTime() - d.getTime()) / 86_400_000);
}

interface Ref {
  name: string;
  emoji: string;
}
interface RangeRow {
  type: string;
  amount: number | string;
  transaction_date: string;
  category_id: string | null;
  category: Ref | Ref[] | null;
}
interface BudgetRow {
  amount: number | string;
  category_id: string;
  category: Ref | Ref[] | null;
}
interface RecentRow {
  id: string;
  type: string;
  amount: number | string;
  description: string | null;
  transaction_date: string;
  category: Ref | Ref[] | null;
  account: { name: string } | { name: string }[] | null;
}
const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export class DashboardRepository implements IDashboardRepository {
  async loadAggregates(workspaceId: string): Promise<DashboardAggregates> {
    const now = new Date();
    const { monthStart, monthEnd, prevStart, prevEnd } = monthBounds(now);

    const [balance, rangeRows, recentRows, upcomingPayments, budgetRows, goals] = await Promise.all(
      [
        this.sumBalance(workspaceId),
        this.rangeRows(workspaceId, prevStart, monthEnd),
        this.recentRows(workspaceId),
        this.upcoming(workspaceId, now),
        this.budgetRows(workspaceId),
        this.goals(workspaceId),
      ],
    );

    const monthRows = rangeRows.filter((r) => r.transaction_date >= monthStart);
    const income = sum(monthRows.filter((r) => r.type === 'income'));
    const expense = sum(monthRows.filter((r) => r.type === 'expense'));
    const prevExpense = sum(
      rangeRows.filter(
        (r) =>
          r.type === 'expense' && r.transaction_date >= prevStart && r.transaction_date <= prevEnd,
      ),
    );

    return {
      balance,
      summary: { income, expense, available: income - expense },
      categories: buildCategories(monthRows, expense),
      recentActivity: recentRows.map(mapActivity),
      upcomingPayments,
      budgets: buildBudgets(monthRows, budgetRows),
      goals,
      hasTransactions: recentRows.length > 0,
      daysSinceLastMovement: recentRows[0] ? daysSince(recentRows[0].transaction_date, now) : null,
      previousMonthExpense: rangeRows.length > 0 ? prevExpense : null,
    };
  }

  private async sumBalance(workspaceId: string): Promise<number> {
    const { data, error } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false);
    if (error) return 0;
    return (data ?? []).reduce(
      (s, r) => s + Number((r as { current_balance: number | string }).current_balance),
      0,
    );
  }

  private async rangeRows(workspaceId: string, from: string, to: string): Promise<RangeRow[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('type,amount,transaction_date,category_id, category:categories(name,emoji)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'confirmed')
      .gte('transaction_date', from)
      .lte('transaction_date', to);
    if (error) return [];
    return (data ?? []) as unknown as RangeRow[];
  }

  private async budgetRows(workspaceId: string): Promise<BudgetRow[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('amount,category_id, category:categories(name,emoji)')
      .eq('workspace_id', workspaceId);
    if (error) return [];
    return (data ?? []) as unknown as BudgetRow[];
  }

  private async goals(workspaceId: string): Promise<DashboardGoal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('name,emoji,current_amount,target_amount')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');
    if (error) return [];
    return (
      (data ?? []) as Array<{
        name: string;
        emoji: string;
        current_amount: number | string;
        target_amount: number | string;
      }>
    ).map((row) => ({
      name: row.name,
      emoji: row.emoji,
      current: Number(row.current_amount),
      target: Number(row.target_amount),
    }));
  }

  private async recentRows(workspaceId: string): Promise<RecentRow[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id,type,amount,description,transaction_date, category:categories(name,emoji), account:accounts!account_id(name)',
      )
      .eq('workspace_id', workspaceId)
      .eq('status', 'confirmed')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) return [];
    return (data ?? []) as RecentRow[];
  }

  private async upcoming(workspaceId: string, now: Date): Promise<DashboardUpcomingPayment[]> {
    const today = ymd(now.getFullYear(), now.getMonth(), now.getDate());
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + 14);
    const to = ymd(windowEnd.getFullYear(), windowEnd.getMonth(), windowEnd.getDate());

    const { data, error } = await supabase
      .from('calendar_events')
      .select('id,title,emoji,event_date')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .gte('event_date', today)
      .lte('event_date', to)
      .order('event_date', { ascending: true })
      .limit(5);
    if (error) return [];

    return (
      (data ?? []) as Array<{ id: string; title: string; emoji: string; event_date: string }>
    ).map((row) => ({
      id: row.id,
      name: row.title,
      emoji: row.emoji,
      dueInDays: daysUntil(row.event_date, now),
      date: row.event_date,
    }));
  }
}

function sum(rows: Array<{ amount: number | string }>): number {
  return rows.reduce((s, r) => s + Number(r.amount), 0);
}

function buildCategories(rows: RangeRow[], totalExpense: number): DashboardCategory[] {
  const map = new Map<string, DashboardCategory>();
  for (const row of rows) {
    if (row.type !== 'expense') continue;
    const cat = one(row.category);
    if (!cat) continue;
    const existing = map.get(cat.name);
    const amount = Number(row.amount) + (existing?.amount ?? 0);
    map.set(cat.name, {
      id: cat.name,
      name: cat.name,
      emoji: cat.emoji,
      amount,
      percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    });
  }
  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function buildBudgets(monthRows: RangeRow[], budgetRows: BudgetRow[]): DashboardBudget[] {
  const spentByCat = new Map<string, number>();
  for (const row of monthRows) {
    if (row.type !== 'expense' || !row.category_id) continue;
    spentByCat.set(row.category_id, (spentByCat.get(row.category_id) ?? 0) + Number(row.amount));
  }
  return budgetRows.map((b) => {
    const cat = one(b.category);
    return {
      name: cat?.name ?? '',
      emoji: cat?.emoji ?? '🏷️',
      spent: spentByCat.get(b.category_id) ?? 0,
      limit: Number(b.amount),
    };
  });
}

function mapActivity(row: RecentRow): DashboardActivityItem {
  const cat = one(row.category);
  const account = one(row.account);
  return {
    id: row.id,
    name: row.description || cat?.name || account?.name || 'Movimiento',
    emoji: cat?.emoji ?? TYPE_EMOJI[row.type] ?? '💸',
    amount: Number(row.amount),
    type: row.type === 'income' ? 'income' : row.type === 'transfer' ? 'transfer' : 'expense',
    date: row.transaction_date,
  };
}

export const dashboardRepository = new DashboardRepository();
