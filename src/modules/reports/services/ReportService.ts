import { toPercent } from '@/shared/utils/money';
import {
  reportRepository,
  type IReportRepository,
  type ReportRow,
} from '../repositories/ReportRepository';
import { periodRange } from '../utils/period';
import { SLICE_OTHER_COLOR, SLICE_PALETTE } from '../constants/report.constants';
import type { CategorySlice, MonthPoint, ReportData, ReportPeriod } from '../types/report.types';

const MAX_SLICES = 6;

/**
 * ReportService — analítica (Cap. 6.14). Agrega transacciones del periodo.
 * Las transferencias no cuentan como ingreso/gasto (RB-007).
 */
export class ReportService {
  constructor(private readonly repo: IReportRepository = reportRepository) {}

  async load(workspaceId: string, currency: string, period: ReportPeriod): Promise<ReportData> {
    const { from, to, months } = periodRange(period);
    const rows = await this.repo.fetchRange(workspaceId, currency, from, to);

    const income = sumType(rows, 'income');
    const expense = sumType(rows, 'expense');

    return {
      from,
      to,
      income,
      expense,
      balance: income - expense,
      expenseByCategory: buildSlices(rows, expense),
      trend: buildTrend(rows, months),
    };
  }
}

function sumType(rows: ReportRow[], type: ReportRow['type']): number {
  return rows.filter((r) => r.type === type).reduce((s, r) => s + r.amount, 0);
}

function buildSlices(rows: ReportRow[], totalExpense: number): CategorySlice[] {
  const map = new Map<string, { name: string; emoji: string; amount: number }>();
  for (const row of rows) {
    if (row.type !== 'expense' || !row.categoryName) continue;
    const key = row.categoryName;
    const prev = map.get(key);
    map.set(key, {
      name: row.categoryName,
      emoji: row.categoryEmoji ?? '🏷️',
      amount: (prev?.amount ?? 0) + row.amount,
    });
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);

  const slices: CategorySlice[] = top.map((item, index) => ({
    ...item,
    percent: toPercent(item.amount, totalExpense),
    color: SLICE_PALETTE[index] ?? SLICE_OTHER_COLOR,
  }));

  if (rest.length > 0) {
    const amount = rest.reduce((s, r) => s + r.amount, 0);
    slices.push({
      name: 'Otros',
      emoji: '•',
      amount,
      percent: toPercent(amount, totalExpense),
      color: SLICE_OTHER_COLOR,
    });
  }
  return slices;
}

function buildTrend(
  rows: ReportRow[],
  months: Array<{ month: string; label: string }>,
): MonthPoint[] {
  return months.map(({ month, label }) => {
    const monthRows = rows.filter((r) => r.month === month);
    return {
      month,
      label,
      income: sumType(monthRows, 'income'),
      expense: sumType(monthRows, 'expense'),
    };
  });
}

export const reportService = new ReportService();
