import type { CategoryType } from '../types/category.types';

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  expense: 'Gastos',
  income: 'Ingresos',
};

/** Emojis sugeridos para categorías (Cap. 3.13). */
export const CATEGORY_EMOJIS = [
  '🍔',
  '🚗',
  '🏠',
  '🎮',
  '🐶',
  '📚',
  '🏥',
  '💻',
  '✈️',
  '💄',
  '🛒',
  '💡',
  '🎬',
  '👕',
  '🎁',
  '💰',
  '💼',
  '📈',
  '🏦',
  '🎓',
  '☕',
  '⚽',
  '🚌',
  '🏷️',
];
