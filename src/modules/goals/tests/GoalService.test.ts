import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalService } from '../services/GoalService';
import type { IGoalRepository } from '../repositories/GoalRepository';
import type { Goal } from '../types/goal.types';

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    workspaceId: 'ws1',
    emoji: '✈️',
    name: 'Japón',
    targetAmount: 1000,
    currentAmount: 500,
    targetDate: null,
    status: 'active',
    ...overrides,
  };
}

describe('GoalService', () => {
  let repo: IGoalRepository;
  let service: GoalService;

  beforeEach(() => {
    repo = {
      list: vi.fn().mockResolvedValue([makeGoal()]),
      create: vi.fn(),
      update: vi.fn(),
      setStatus: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn(),
      addContribution: vi.fn().mockResolvedValue(undefined),
    };
    service = new GoalService(repo);
  });

  it('calcula avance (restante y porcentaje)', async () => {
    const [goal] = await service.listWithProgress('ws1');
    expect(goal!.remaining).toBe(500);
    expect(goal!.percent).toBe(50);
  });

  it('aportar registra la contribución positiva', async () => {
    await service.deposit(makeGoal(), 200);
    expect(repo.addContribution).toHaveBeenCalledWith('ws1', 'g1', 200);
    expect(repo.setStatus).not.toHaveBeenCalled();
  });

  it('aportar hasta la meta la completa automáticamente', async () => {
    await service.deposit(makeGoal({ currentAmount: 900 }), 100);
    expect(repo.setStatus).toHaveBeenCalledWith('g1', 'completed');
  });

  it('retirar registra contribución negativa', async () => {
    await service.withdraw(makeGoal(), 200);
    expect(repo.addContribution).toHaveBeenCalledWith('ws1', 'g1', -200);
  });

  it('no permite retirar más de lo ahorrado (RB-008)', async () => {
    await expect(service.withdraw(makeGoal({ currentAmount: 100 }), 500)).rejects.toThrow();
  });
});
