import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetService } from '../services/BudgetService';
import type { IBudgetRepository } from '../repositories/BudgetRepository';
import type { Budget } from '../types/budget.types';

function budget(id: string, categoryId: string, currency = 'COP'): Budget {
  return {
    id,
    workspaceId: 'ws1',
    categoryId,
    amount: 100,
    currency,
    period: 'monthly',
    warningPercentage: 80,
    categoryName: categoryId,
    categoryEmoji: '🍔',
  };
}

describe('BudgetService.listWithProgress', () => {
  let repo: IBudgetRepository;
  let service: BudgetService;

  beforeEach(() => {
    repo = {
      list: vi.fn().mockResolvedValue([budget('b1', 'a'), budget('b2', 'b'), budget('b3', 'c')]),
      spentByCategory: vi.fn().mockResolvedValue(
        new Map([
          ['a:COP', 50],
          ['b:COP', 85],
          ['c:COP', 120],
          ['a:USD', 999],
        ]),
      ),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    service = new BudgetService(repo);
  });

  it('calcula estado normal/advertencia/excedido', async () => {
    const result = await service.listWithProgress('ws1');
    const byId = Object.fromEntries(result.map((b) => [b.id, b]));
    expect(byId.b1!.status).toBe('normal');
    expect(byId.b2!.status).toBe('warning');
    expect(byId.b3!.status).toBe('exceeded');
  });

  it('ordena por porcentaje descendente', async () => {
    const result = await service.listWithProgress('ws1');
    expect(result.map((b) => b.id)).toEqual(['b3', 'b2', 'b1']);
  });

  it('calcula el restante', async () => {
    const result = await service.listWithProgress('ws1');
    const b1 = result.find((b) => b.id === 'b1');
    expect(b1?.remaining).toBe(50);
    expect(b1?.percent).toBe(50);
  });

  it('solo suma gastos en la moneda del presupuesto', async () => {
    vi.mocked(repo.list).mockResolvedValue([budget('usd', 'a', 'USD'), budget('eur', 'a', 'EUR')]);
    const result = await service.listWithProgress('ws1');
    expect(result.find((b) => b.id === 'usd')?.spent).toBe(999);
    expect(result.find((b) => b.id === 'eur')?.spent).toBe(0);
  });
});
