import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type {
  CalendarEvent,
  EventFlow,
  EventStatus,
  UpdateEventDTO,
} from '../types/calendar.types';

const COLS =
  'id,workspace_id,recurring_id,transaction_id,title,emoji,flow,amount,account_id,category_id,event_date,status,notes';

interface EventRow {
  id: string;
  workspace_id: string;
  recurring_id: string | null;
  transaction_id: string | null;
  title: string;
  emoji: string;
  flow: EventFlow;
  amount: number | string;
  account_id: string | null;
  category_id: string | null;
  event_date: string;
  status: EventStatus;
  notes: string | null;
}

function mapEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    recurringId: row.recurring_id,
    transactionId: row.transaction_id,
    title: row.title,
    emoji: row.emoji,
    flow: row.flow,
    amount: Number(row.amount),
    accountId: row.account_id,
    categoryId: row.category_id,
    date: row.event_date,
    status: row.status,
    notes: row.notes,
  };
}

export interface EventParams {
  title: string;
  emoji: string;
  flow: EventFlow;
  amount: number;
  accountId?: string | null;
  categoryId?: string | null;
  date: string;
  notes?: string | null;
  recurringId?: string | null;
}

export interface RecurringParams {
  title: string;
  emoji: string;
  flow: EventFlow;
  amount: number;
  accountId?: string | null;
  categoryId?: string | null;
  nextExecution: string;
}

export interface ICalendarRepository {
  listRange(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]>;
  listUpcoming(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]>;
  createEvent(workspaceId: string, params: EventParams): Promise<CalendarEvent>;
  createRecurring(workspaceId: string, params: RecurringParams): Promise<string>;
  update(id: string, dto: UpdateEventDTO): Promise<CalendarEvent>;
  setStatus(id: string, status: EventStatus, transactionId?: string | null): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export class CalendarRepository implements ICalendarRepository {
  async listRange(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .gte('event_date', from)
      .lte('event_date', to)
      .order('event_date', { ascending: true });
    if (error) throw toAppError(error, 'No pudimos cargar el calendario.');
    return ((data ?? []) as EventRow[]).map(mapEvent);
  }

  async listUpcoming(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .gte('event_date', from)
      .lte('event_date', to)
      .order('event_date', { ascending: true });
    if (error) throw toAppError(error, 'No pudimos cargar los próximos pagos.');
    return ((data ?? []) as EventRow[]).map(mapEvent);
  }

  async createEvent(workspaceId: string, params: EventParams): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        workspace_id: workspaceId,
        recurring_id: params.recurringId ?? null,
        title: params.title,
        emoji: params.emoji,
        flow: params.flow,
        amount: params.amount,
        account_id: params.accountId ?? null,
        category_id: params.categoryId ?? null,
        event_date: params.date,
        notes: params.notes ?? null,
      })
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear el evento.');
    return mapEvent(data as EventRow);
  }

  async createRecurring(workspaceId: string, params: RecurringParams): Promise<string> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        workspace_id: workspaceId,
        title: params.title,
        emoji: params.emoji,
        flow: params.flow,
        amount: params.amount,
        account_id: params.accountId ?? null,
        category_id: params.categoryId ?? null,
        frequency: 'monthly',
        next_execution: params.nextExecution,
      })
      .select('id')
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear el gasto fijo.');
    return (data as { id: string }).id;
  }

  async update(id: string, dto: UpdateEventDTO): Promise<CalendarEvent> {
    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.emoji !== undefined) patch.emoji = dto.emoji;
    if (dto.flow !== undefined) patch.flow = dto.flow;
    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.accountId !== undefined) patch.account_id = dto.accountId;
    if (dto.categoryId !== undefined) patch.category_id = dto.categoryId;
    if (dto.date !== undefined) patch.event_date = dto.date;
    if (dto.notes !== undefined) patch.notes = dto.notes;

    const { data, error } = await supabase
      .from('calendar_events')
      .update(patch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar el evento.');
    return mapEvent(data as EventRow);
  }

  async setStatus(id: string, status: EventStatus, transactionId?: string | null): Promise<void> {
    const patch: Record<string, unknown> = { status };
    if (transactionId !== undefined) patch.transaction_id = transactionId;
    const { error } = await supabase.from('calendar_events').update(patch).eq('id', id);
    if (error) throw toAppError(error, 'No pudimos actualizar el evento.');
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_record', {
      p_table: 'calendar_events',
      p_id: id,
    });
    if (error) throw toAppError(error, 'No pudimos eliminar el evento.');
  }
}

export const calendarRepository = new CalendarRepository();
