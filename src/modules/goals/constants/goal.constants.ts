import type { GoalStatus } from '../types/goal.types';

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

/** Emojis sugeridos para metas (Cap. 3.13). */
export const GOAL_EMOJIS = ['🎯', '✈️', '🏠', '🚗', '🎓', '💍', '📱', '💻', '🏖️', '🚀', '👶', '💰'];
