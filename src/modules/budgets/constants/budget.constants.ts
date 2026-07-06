import type { BudgetStatus } from '../types/budget.types';

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  normal: 'En control',
  warning: 'Cerca del límite',
  exceeded: 'Excedido',
};

/** Clases de color por estado (Cap. 3.5): verde/naranja/rojo. */
export const BUDGET_STATUS_BAR: Record<BudgetStatus, string> = {
  normal: 'bg-success',
  warning: 'bg-warning',
  exceeded: 'bg-destructive',
};

export const BUDGET_STATUS_TEXT: Record<BudgetStatus, string> = {
  normal: 'text-success',
  warning: 'text-warning',
  exceeded: 'text-destructive',
};
