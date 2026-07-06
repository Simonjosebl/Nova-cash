import type { Insight } from './insight.types';

export interface DashboardSummary {
  income: number;
  expense: number;
  available: number;
}

export interface DashboardCategory {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  percent: number;
}

export type ActivityType = 'income' | 'expense' | 'transfer';

export interface DashboardActivityItem {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  type: ActivityType;
  date: string;
}

export interface DashboardUpcomingPayment {
  id: string;
  name: string;
  emoji: string;
  dueInDays: number;
  date: string;
}

/** Respuesta única de loadDashboard() (Cap. 8 — nunca 10 consultas desde React). */
export interface DashboardData {
  currency: string;
  balance: number;
  summary: DashboardSummary;
  categories: DashboardCategory[];
  recentActivity: DashboardActivityItem[];
  upcomingPayments: DashboardUpcomingPayment[];
  insights: Insight[];
}

export interface DashboardBudget {
  name: string;
  emoji: string;
  spent: number;
  limit: number;
}

export interface DashboardGoal {
  name: string;
  emoji: string;
  current: number;
  target: number;
}

/** Agregados crudos que produce el repositorio (antes de armar insights). */
export interface DashboardAggregates {
  balance: number;
  summary: DashboardSummary;
  categories: DashboardCategory[];
  recentActivity: DashboardActivityItem[];
  upcomingPayments: DashboardUpcomingPayment[];
  budgets: DashboardBudget[];
  goals: DashboardGoal[];
  hasTransactions: boolean;
  daysSinceLastMovement: number | null;
  previousMonthExpense: number | null;
}
