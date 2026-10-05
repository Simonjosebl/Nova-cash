/** Qué recuerda registrar (R-13). */
export type ReminderKind = 'expense' | 'income' | 'any';

/** Día ISO: 1 = lunes … 7 = domingo. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IReminder {
  id: string;
  workspaceId: string;
  kind: ReminderKind;
  /** Hora local "HH:MM". */
  time: string;
  days: IsoWeekday[];
  enabled: boolean;
}

export interface SaveReminderDTO {
  kind: ReminderKind;
  time: string;
  days: IsoWeekday[];
  enabled: boolean;
}
