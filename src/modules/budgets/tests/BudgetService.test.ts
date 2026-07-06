import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetService } from '../services/BudgetService';
import type { IBudgetRepository } from '../repositories/BudgetRepository';
import type { Budget } from '../types/budget.types';

function budget(id: string, categoryId: string): Budget {
  return {
    id,
    workspaceId: 'ws1',
    categoryId,
    amount: 100,
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
          ['a', 50],
          ['b', 85],
          ['c', 120],
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
});
