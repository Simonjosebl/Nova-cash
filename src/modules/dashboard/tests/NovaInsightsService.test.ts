import { describe, it, expect } from 'vitest';
import { generateInsights } from '../services/NovaInsightsService';
import type { InsightInput } from '../types/insight.types';

function input(overrides: Partial<InsightInput> = {}): InsightInput {
  return {
    currency: 'COP',
    hasTransactions: true,
    daysSinceLastMovement: 0,
    monthlyExpense: 0,
    previousMonthlyExpense: null,
    budgets: [],
    goals: [],
    upcomingPayments: [],
    ...overrides,
  };
}

describe('generateInsights', () => {
  it('sin transacciones sugiere registrar el primer movimiento', () => {
    const result = generateInsights(input({ hasTransactions: false }));
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('first-movement');
    expect(result[0]!.priority).toBe('motivational');
  });

  it('avisa inactividad tras 3+ días', () => {
    const result = generateInsights(input({ daysSinceLastMovement: 4 }));
    expect(result.some((i) => i.id === 'inactivity')).toBe(true);
  });

  it('no avisa inactividad por debajo del umbral', () => {
    const result = generateInsights(input({ daysSinceLastMovement: 2 }));
    expect(result.some((i) => i.id === 'inactivity')).toBe(false);
  });

  it('marca pago que vence hoy como advertencia', () => {
    const result = generateInsights(
      input({ upcomingPayments: [{ name: 'Arriendo', emoji: '🏠', dueInDays: 0 }] }),
    );
    const due = result.find((i) => i.id === 'due-Arriendo');
    expect(due?.priority).toBe('warning');
    expect(due?.message).toContain('Arriendo');
  });

  it('presupuesto excedido es crítico; al 80% es advertencia', () => {
    const over = generateInsights(
      input({ budgets: [{ name: 'Comida', emoji: '🍔', spent: 120, limit: 100 }] }),
    );
    expect(over.find((i) => i.id === 'budget-over-Comida')?.priority).toBe('critical');

    const warn = generateInsights(
      input({ budgets: [{ name: 'Ocio', emoji: '🎮', spent: 85, limit: 100 }] }),
    );
    expect(warn.find((i) => i.id === 'budget-warn-Ocio')?.priority).toBe('warning');

    const none = generateInsights(
      input({ budgets: [{ name: 'Salud', emoji: '🏥', spent: 10, limit: 100 }] }),
    );
    expect(none).toHaveLength(0);
  });

  it('celebra reducción de gasto pero nunca el aumento', () => {
    const down = generateInsights(input({ monthlyExpense: 80, previousMonthlyExpense: 100 }));
    expect(down.find((i) => i.id === 'spending-down')?.message).toContain('20%');

    const up = generateInsights(input({ monthlyExpense: 150, previousMonthlyExpense: 100 }));
    expect(up.some((i) => i.id === 'spending-down')).toBe(false);
  });

  it('motiva cuando una meta está cerca (>=90%)', () => {
    const result = generateInsights(
      input({ goals: [{ name: 'Japón', emoji: '✈️', current: 95, target: 100 }] }),
    );
    const goal = result.find((i) => i.id === 'goal-near-Japón');
    expect(goal?.priority).toBe('motivational');
    expect(goal?.message).toContain('Japón');
  });

  it('nunca muestra más de tres insights', () => {
    const result = generateInsights(
      input({
        upcomingPayments: [
          { name: 'A', emoji: '🏠', dueInDays: 0 },
          { name: 'B', emoji: '💡', dueInDays: 0 },
        ],
        budgets: [
          { name: 'C', emoji: '🍔', spent: 200, limit: 100 },
          { name: 'D', emoji: '🚗', spent: 200, limit: 100 },
        ],
        goals: [{ name: 'E', emoji: '✈️', current: 95, target: 100 }],
      }),
    );
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('prioriza crítico sobre motivacional e informativo', () => {
    const result = generateInsights(
      input({
        daysSinceLastMovement: 5,
        budgets: [{ name: 'C', emoji: '🍔', spent: 200, limit: 100 }],
        goals: [{ name: 'E', emoji: '✈️', current: 95, target: 100 }],
      }),
    );
    expect(result[0]!.priority).toBe('critical');
  });

  it('deduplica insights con el mismo id', () => {
    const result = generateInsights(
      input({
        upcomingPayments: [
          { name: 'Arriendo', emoji: '🏠', dueInDays: 0 },
          { name: 'Arriendo', emoji: '🏠', dueInDays: 0 },
        ],
      }),
    );
    expect(result.filter((i) => i.id === 'due-Arriendo')).toHaveLength(1);
  });
});
