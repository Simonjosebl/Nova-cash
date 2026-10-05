export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type BudgetStatus = 'normal' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  workspaceId: string;
  categoryId: string;
  amount: number;
  /** Moneda propia del presupuesto (R-08). */
  currency: string;
  period: BudgetPeriod;
  warningPercentage: number;
  categoryName: string;
  categoryEmoji: string;
}

/** Presupuesto con su avance calculado (Cap. 6.12). */
export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
}

export interface CreateBudgetDTO {
  categoryId: string;
  amount: number;
  currency: string;
  warningPercentage: number;
}

export interface UpdateBudgetDTO {
  amount?: number;
  currency?: string;
  warningPercentage?: number;
}
