import { formatMoney, toPercent } from '@/shared/utils/money';
import {
  MAX_INSIGHTS,
  PRIORITY_RANK,
  type Insight,
  type InsightInput,
} from '../types/insight.types';

/**
 * Motor Nova Insights (Cap. 4.17 / 6.7 / 20). Reglas de negocio, NO IA.
 * Reglas: útiles, positivas, accionables · máximo 3 · sin repetidos · sin mensajes negativos.
 * Función pura y determinista (cobertura objetivo 100% — Cap. 10.5).
 */

const INACTIVITY_THRESHOLD_DAYS = 3;
const BUDGET_WARNING_PERCENT = 80;
const GOAL_NEAR_PERCENT = 90;

function ruleFirstMovement(input: InsightInput): Insight[] {
  if (input.hasTransactions) return [];
  return [
    {
      id: 'first-movement',
      priority: 'motivational',
      emoji: '✨',
      message: 'Registra tu primer movimiento para empezar a comprender tu dinero.',
    },
  ];
}

function ruleInactivity(input: InsightInput): Insight[] {
  if (!input.hasTransactions || input.daysSinceLastMovement === null) return [];
  if (input.daysSinceLastMovement < INACTIVITY_THRESHOLD_DAYS) return [];
  return [
    {
      id: 'inactivity',
      priority: 'informative',
      emoji: '📝',
      message: `Llevas ${input.daysSinceLastMovement} días sin registrar movimientos.`,
    },
  ];
}

function ruleDuePayments(input: InsightInput): Insight[] {
  return input.upcomingPayments
    .filter((p) => p.dueInDays === 0)
    .map((p) => ({
      id: `due-${p.name}`,
      priority: 'warning' as const,
      emoji: '⚠️',
      message: `Hoy vence ${p.emoji} ${p.name}.`,
    }));
}

function ruleBudgets(input: InsightInput): Insight[] {
  const insights: Insight[] = [];
  for (const b of input.budgets) {
    const pct = toPercent(b.spent, b.limit);
    if (pct >= 100) {
      insights.push({
        id: `budget-over-${b.name}`,
        priority: 'critical',
        emoji: '🚨',
        message: `Excediste tu presupuesto de ${b.emoji} ${b.name}.`,
      });
    } else if (pct >= BUDGET_WARNING_PERCENT) {
      insights.push({
        id: `budget-warn-${b.name}`,
        priority: 'warning',
        emoji: '📊',
        message: `Tu presupuesto de ${b.emoji} ${b.name} está al ${pct}%.`,
      });
    }
  }
  return insights;
}

function ruleSpendingComparison(input: InsightInput): Insight[] {
  const prev = input.previousMonthlyExpense;
  // Solo se celebra la reducción; nunca mensajes negativos (Cap. 6.7).
  if (prev === null || prev <= 0 || input.monthlyExpense >= prev) return [];
  const pct = toPercent(prev - input.monthlyExpense, prev);
  if (pct <= 0) return [];
  return [
    {
      id: 'spending-down',
      priority: 'motivational',
      emoji: '🎉',
      message: `Gastaste ${pct}% menos que el mes pasado. Excelente trabajo.`,
    },
  ];
}

function ruleGoals(input: InsightInput): Insight[] {
  const insights: Insight[] = [];
  for (const g of input.goals) {
    if (g.target <= 0) continue;
    const pct = toPercent(g.current, g.target);
    const remaining = g.target - g.current;
    if (pct >= GOAL_NEAR_PERCENT && remaining > 0) {
      insights.push({
        id: `goal-near-${g.name}`,
        priority: 'motivational',
        emoji: '🎯',
        message: `Solo faltan ${formatMoney(remaining, input.currency)} para tu meta ${g.emoji} ${g.name}.`,
      });
    }
  }
  return insights;
}

/** Genera los insights priorizados (máx. 3, sin repetidos). */
export function generateInsights(input: InsightInput): Insight[] {
  const all = [
    ...ruleFirstMovement(input),
    ...ruleDuePayments(input),
    ...ruleBudgets(input),
    ...ruleSpendingComparison(input),
    ...ruleGoals(input),
    ...ruleInactivity(input),
  ];

  const seen = new Set<string>();
  const unique = all.filter((i) => (seen.has(i.id) ? false : seen.add(i.id)));
  unique.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  return unique.slice(0, MAX_INSIGHTS);
}
