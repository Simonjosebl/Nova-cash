/** Nova Insights (Cap. 4.17 / 6.7 / 20). Motor de reglas, NO IA. */

export type InsightPriority = 'critical' | 'warning' | 'motivational' | 'informative';

export interface Insight {
  id: string;
  priority: InsightPriority;
  emoji: string;
  message: string;
}

export interface InsightBudget {
  name: string;
  emoji: string;
  spent: number;
  limit: number;
}

export interface InsightGoal {
  name: string;
  emoji: string;
  current: number;
  target: number;
}

export interface InsightPayment {
  name: string;
  emoji: string;
  dueInDays: number;
}

/** Entradas del motor (Cap. 4.17): transacciones, calendario, presupuestos, metas, comparativos. */
export interface InsightInput {
  currency: string;
  hasTransactions: boolean;
  daysSinceLastMovement: number | null;
  monthlyExpense: number;
  previousMonthlyExpense: number | null;
  budgets: InsightBudget[];
  goals: InsightGoal[];
  upcomingPayments: InsightPayment[];
}

/** Nunca mostrar más de tres (Cap. 6.7). */
export const MAX_INSIGHTS = 3;

/** Orden de prioridad (Cap. 6.7): crítico → advertencia → motivacional → informativo. */
export const PRIORITY_RANK: Record<InsightPriority, number> = {
  critical: 0,
  warning: 1,
  motivational: 2,
  informative: 3,
};
