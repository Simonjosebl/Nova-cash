import type { IsoWeekday, ReminderKind } from '../types/reminder.types';

export const REMINDER_KINDS: ReadonlyArray<{ value: ReminderKind; label: string; emoji: string }> =
  [
    { value: 'any', label: 'Gastos e ingresos', emoji: '✍️' },
    { value: 'expense', label: 'Gastos', emoji: '💸' },
    { value: 'income', label: 'Ingresos', emoji: '💰' },
  ];

export const WEEKDAYS: ReadonlyArray<{ value: IsoWeekday; short: string; long: string }> = [
  { value: 1, short: 'L', long: 'Lun' },
  { value: 2, short: 'M', long: 'Mar' },
  { value: 3, short: 'X', long: 'Mié' },
  { value: 4, short: 'J', long: 'Jue' },
  { value: 5, short: 'V', long: 'Vie' },
  { value: 6, short: 'S', long: 'Sáb' },
  { value: 7, short: 'D', long: 'Dom' },
];

export const ALL_DAYS: IsoWeekday[] = [1, 2, 3, 4, 5, 6, 7];
export const WEEKDAYS_ONLY: IsoWeekday[] = [1, 2, 3, 4, 5];

/** Máximo de recordatorios por espacio (nunca spam — Cap. 4.20). */
export const MAX_REMINDERS = 5;
