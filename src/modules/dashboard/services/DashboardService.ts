import {
  dashboardRepository,
  type IDashboardRepository,
} from '../repositories/DashboardRepository';
import { generateInsights } from './NovaInsightsService';
import type { DashboardData } from '../types/dashboard.types';
import type { InsightInput } from '../types/insight.types';

/**
 * DashboardService — arma el DashboardData en una sola llamada (Cap. 8 / 4.16).
 * Ejecuta el motor Nova Insights sobre los agregados (ADR-060).
 */
export class DashboardService {
  constructor(private readonly repo: IDashboardRepository = dashboardRepository) {}

  async loadDashboard(workspaceId: string, currency: string): Promise<DashboardData> {
    const agg = await this.repo.loadAggregates(workspaceId, currency);

    const insightInput: InsightInput = {
      currency,
      hasTransactions: agg.hasTransactions,
      daysSinceLastMovement: agg.daysSinceLastMovement,
      monthlyExpense: agg.summary.expense,
      previousMonthlyExpense: agg.previousMonthExpense,
      budgets: agg.budgets,
      goals: agg.goals,
      upcomingPayments: agg.upcomingPayments.map((p) => ({
        name: p.name,
        emoji: p.emoji,
        dueInDays: p.dueInDays,
      })),
    };

    return {
      currency,
      balance: agg.balance,
      summary: agg.summary,
      categories: agg.categories,
      recentActivity: agg.recentActivity,
      upcomingPayments: agg.upcomingPayments,
      insights: generateInsights(insightInput),
    };
  }
}

export const dashboardService = new DashboardService();
