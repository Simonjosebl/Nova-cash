export type EventStatus = 'pending' | 'paid' | 'cancelled';
export type EventFlow = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  recurringId: string | null;
  transactionId: string | null;
  title: string;
  emoji: string;
  flow: EventFlow;
  amount: number;
  accountId: string | null;
  categoryId: string | null;
  date: string; // YYYY-MM-DD
  status: EventStatus;
  notes: string | null;
}

export interface CreateEventDTO {
  title: string;
  emoji: string;
  flow: EventFlow;
  amount: number;
  accountId?: string | null;
  categoryId?: string | null;
  date: string;
  notes?: string | null;
  repeatMonthly?: boolean;
}

export type UpdateEventDTO = Partial<Omit<CreateEventDTO, 'repeatMonthly'>>;
