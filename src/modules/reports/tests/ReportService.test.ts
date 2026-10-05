import { describe, it, expect, vi } from 'vitest';
import { ReportService } from '../services/ReportService';
import type { IReportRepository, ReportRow } from '../repositories/ReportRepository';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

function rows(): ReportRow[] {
  return [
    {
      type: 'income',
      amount: 3000,
      month: CURRENT_MONTH,
      categoryName: 'Sueldo',
      categoryEmoji: '💼',
    },
    {
      type: 'expense',
      amount: 800,
      month: CURRENT_MONTH,
      categoryName: 'Comida',
      categoryEmoji: '🍔',
    },
    {
      type: 'expense',
      amount: 200,
      month: CURRENT_MONTH,
      categoryName: 'Transporte',
      categoryEmoji: '🚗',
    },
    {
      type: 'transfer',
      amount: 500,
      month: CURRENT_MONTH,
      categoryName: null,
      categoryEmoji: null,
    },
  ];
}

function service(data: ReportRow[]): ReportService {
  const repo: IReportRepository = { fetchRange: vi.fn().mockResolvedValue(data) };
  return new ReportService(repo);
}

describe('ReportService.load', () => {
  it('suma ingresos y gastos, ignorando transferencias (RB-007)', async () => {
    const data = await service(rows()).load('ws1', 'COP', 'this_month');
    expect(data.income).toBe(3000);
    expect(data.expense).toBe(1000);
    expect(data.balance).toBe(2000);
  });

  it('construye el donut por categoría con porcentajes', async () => {
    const data = await service(rows()).load('ws1', 'COP', 'this_month');
    const comida = data.expenseByCategory.find((s) => s.name === 'Comida');
    expect(comida?.percent).toBe(80);
    expect(data.expenseByCategory.every((s) => s.color)).toBe(true);
  });

  it('agrupa "Otros" cuando hay más de seis categorías', async () => {
    const many: ReportRow[] = Array.from({ length: 8 }, (_, i) => ({
      type: 'expense' as const,
      amount: 100,
      month: CURRENT_MONTH,
      categoryName: `Cat${i}`,
      categoryEmoji: '🏷️',
    }));
    const data = await service(many).load('ws1', 'COP', 'this_month');
    expect(data.expenseByCategory.length).toBe(7);
    expect(data.expenseByCategory.some((s) => s.name === 'Otros')).toBe(true);
  });

  it('devuelve un punto de tendencia por mes del periodo', async () => {
    const data = await service(rows()).load('ws1', 'COP', 'this_month');
    expect(data.trend.length).toBe(1);
    expect(data.trend[0]!.income).toBe(3000);
    expect(data.trend[0]!.expense).toBe(1000);
  });
});
