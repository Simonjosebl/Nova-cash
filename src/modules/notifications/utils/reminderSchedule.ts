import { WEEKDAYS } from '../constants/reminder.constants';
import type { IsoWeekday } from '../types/reminder.types';

/** "20:00" → "8:00 p. m." (formato local es-CO). */
export function formatReminderTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}

/** Describe los días en lenguaje humano: "Todos los días", "Entre semana", "Lun, Mié". */
export function describeDays(days: ReadonlyArray<IsoWeekday>): string {
  const set = new Set(days);
  if (set.size === 7) return 'Todos los días';
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d as IsoWeekday))) {
    return 'Entre semana';
  }
  if (set.size === 2 && set.has(6) && set.has(7)) return 'Fines de semana';
  return WEEKDAYS.filter((d) => set.has(d.value))
    .map((d) => d.long)
    .join(', ');
}
