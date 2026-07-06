import type { NotificationPriority } from '../types/notification.types';

/** Emoji por prioridad (Cap. 3 — identidad visual). */
export const NOTIFICATION_EMOJI: Record<NotificationPriority, string> = {
  critical: '🚨',
  warning: '⚠️',
  info: '🔔',
  success: '✅',
};
