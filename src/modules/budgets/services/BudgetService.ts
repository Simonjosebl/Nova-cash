import { currentMonthRange } from '@/shared/utils/date';
import { toPercent } from '@/shared/utils/money';
import { budgetRepository, type IBudgetRepository } from '../repositories/BudgetRepository';
import { spentKey } from '../utils/spentKey';
import type {
  Budget,
  BudgetProgress,
  BudgetStatus,
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from '../types/budget.types';

/**
 * BudgetService — control presupuestal (Cap. 4.14 / 6.12).
 * Calcula el avance del mes actual y su estado (normal / advertencia / excedido).
 * Nunca modifica transacciones (RB-009). El gasto solo cuenta movimientos de cuentas en la
 * misma moneda del presupuesto: no hay conversión automática (R-08).
 */
export class BudgetService {
  constructor(private readonly repo: IBudgetRepository = budgetRepository) {}

  async listWithProgress(workspaceId: string): Promise<BudgetProgress[]> {
    const { start, end } = currentMonthRange();
    const [budgets, spentMap] = await Promise.all([
      this.repo.list(workspaceId),
      this.repo.spentByCategory(workspaceId, start, end),
    ]);

    return budgets
      .map((budget) =>
        this.withProgress(budget, spentMap.get(spentKey(budget.categoryId, budget.currency)) ?? 0),
      )
      .sort((a, b) => b.percent - a.percent);
  }

  private withProgress(budget: Budget, spent: number): BudgetProgress {
    const percent = toPercent(spent, budget.amount);
    let status: BudgetStatus = 'normal';
    if (spent >= budget.amount) status = 'exceeded';
    else if (percent >= budget.warningPercentage) status = 'warning';

    return { ...budget, spent, remaining: budget.amount - spent, percent, status };
  }

  create(workspaceId: string, dto: CreateBudgetDTO): Promise<Budget> {
    return this.repo.create(workspaceId, dto);
  }

  update(id: string, dto: UpdateBudgetDTO): Promise<Budget> {
    return this.repo.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }
}

export const budgetService = new BudgetService();
