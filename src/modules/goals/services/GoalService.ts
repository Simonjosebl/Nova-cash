import { AppError } from '@/shared/types/app-error';
import { toPercent } from '@/shared/utils/money';
import { goalRepository, type IGoalRepository } from '../repositories/GoalRepository';
import type { CreateGoalDTO, Goal, GoalProgress, UpdateGoalDTO } from '../types/goal.types';

/**
 * GoalService — metas de ahorro (Cap. 4.15 / 6.13).
 * Aporte suma; retiro resta (nunca deja el saldo negativo, RB-008).
 * Al alcanzar el objetivo, la meta se completa automáticamente.
 */
export class GoalService {
  constructor(private readonly repo: IGoalRepository = goalRepository) {}

  async listWithProgress(workspaceId: string): Promise<GoalProgress[]> {
    const goals = await this.repo.list(workspaceId);
    return goals.map((goal) => this.withProgress(goal));
  }

  private withProgress(goal: Goal): GoalProgress {
    return {
      ...goal,
      remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
      percent: toPercent(goal.currentAmount, goal.targetAmount),
    };
  }

  create(workspaceId: string, dto: CreateGoalDTO): Promise<Goal> {
    return this.repo.create(workspaceId, dto);
  }

  update(id: string, dto: UpdateGoalDTO): Promise<Goal> {
    return this.repo.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  cancel(id: string): Promise<void> {
    return this.repo.setStatus(id, 'cancelled');
  }

  /** Aporta a una meta. Si alcanza el objetivo, la marca como completada. */
  async deposit(goal: Goal, amount: number): Promise<void> {
    await this.repo.addContribution(goal.workspaceId, goal.id, amount);
    if (goal.status === 'active' && goal.currentAmount + amount >= goal.targetAmount) {
      await this.repo.setStatus(goal.id, 'completed');
    }
  }

  /** Retira de una meta, sin dejar el saldo negativo (RB-008). */
  async withdraw(goal: Goal, amount: number): Promise<void> {
    if (amount > goal.currentAmount) {
      throw new AppError('INSUFFICIENT_BALANCE', 'No puedes retirar más de lo ahorrado.');
    }
    await this.repo.addContribution(goal.workspaceId, goal.id, -amount);
    if (goal.status === 'completed' && goal.currentAmount - amount < goal.targetAmount) {
      await this.repo.setStatus(goal.id, 'active');
    }
  }
}

export const goalService = new GoalService();
