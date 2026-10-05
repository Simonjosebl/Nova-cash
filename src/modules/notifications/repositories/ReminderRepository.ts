import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type { IReminder, IsoWeekday, ReminderKind, SaveReminderDTO } from '../types/reminder.types';

const COLS = 'id,workspace_id,kind,time_of_day,days,enabled';

interface ReminderRow {
  id: string;
  workspace_id: string;
  kind: ReminderKind;
  time_of_day: string;
  days: number[];
  enabled: boolean;
}

function mapReminder(row: ReminderRow): IReminder {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    kind: row.kind,
    time: row.time_of_day.slice(0, 5),
    days: row.days.filter((d): d is IsoWeekday => d >= 1 && d <= 7),
    enabled: row.enabled,
  };
}

function toRow(dto: Partial<SaveReminderDTO>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (dto.kind !== undefined) row.kind = dto.kind;
  if (dto.time !== undefined) row.time_of_day = dto.time;
  if (dto.days !== undefined) row.days = [...dto.days].sort((a, b) => a - b);
  if (dto.enabled !== undefined) row.enabled = dto.enabled;
  return row;
}

/** ReminderRepository — persistencia de los recordatorios del usuario (R-13). */
export interface IReminderRepository {
  list(workspaceId: string): Promise<IReminder[]>;
  create(workspaceId: string, dto: SaveReminderDTO): Promise<IReminder>;
  update(id: string, dto: Partial<SaveReminderDTO>): Promise<IReminder>;
  remove(id: string): Promise<void>;
}

export class ReminderRepository implements IReminderRepository {
  async list(workspaceId: string): Promise<IReminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .order('time_of_day', { ascending: true });
    if (error) throw toAppError(error, 'No pudimos cargar tus recordatorios.');
    return ((data ?? []) as ReminderRow[]).map(mapReminder);
  }

  async create(workspaceId: string, dto: SaveReminderDTO): Promise<IReminder> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .single();
    if (profileError || !profile) throw toAppError(profileError, 'No pudimos cargar tu perfil.');

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...toRow(dto),
        workspace_id: workspaceId,
        profile_id: (profile as { id: string }).id,
      })
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear el recordatorio.');
    return mapReminder(data as ReminderRow);
  }

  async update(id: string, dto: Partial<SaveReminderDTO>): Promise<IReminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(toRow(dto))
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar el recordatorio.');
    return mapReminder(data as ReminderRow);
  }

  // Configuración personal (no es un dato financiero): se borra de verdad (R-13).
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw toAppError(error, 'No pudimos eliminar el recordatorio.');
  }
}

export const reminderRepository = new ReminderRepository();
