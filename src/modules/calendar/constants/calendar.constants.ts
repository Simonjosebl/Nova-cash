import type { EventStatus } from '../types/calendar.types';

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  pending: 'Programado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

/** Emojis frecuentes para eventos (Cap. 4.13: arriendo, energía, Netflix…). */
export const EVENT_EMOJIS = [
  '🏠',
  '💡',
  '📱',
  '🎬',
  '💧',
  '🌐',
  '🚗',
  '💳',
  '🎓',
  '🏥',
  '🐶',
  '📅',
];

export const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Ventana para "próximos pagos" del Dashboard (días). */
export const UPCOMING_WINDOW_DAYS = 14;
