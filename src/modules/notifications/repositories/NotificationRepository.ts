import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type { AppNotification, NotificationPriority } from '../types/notification.types';

const COLS = 'id,title,message,priority,type,read,created_at';

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  type: string;
  read: boolean;
  created_at: string;
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    priority: row.priority,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
  };
}

export interface INotificationRepository {
  list(workspaceId: string): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(workspaceId: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export class NotificationRepository implements INotificationRepository {
  async list(workspaceId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw toAppError(error, 'No pudimos cargar tus notificaciones.');
    return ((data ?? []) as NotificationRow[]).map(mapNotification);
  }

  async markRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw toAppError(error, 'No pudimos actualizar la notificación.');
  }

  async markAllRead(workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('workspace_id', workspaceId)
      .eq('read', false);
    if (error) throw toAppError(error, 'No pudimos actualizar las notificaciones.');
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw toAppError(error, 'No pudimos eliminar la notificación.');
  }
}

export const notificationRepository = new NotificationRepository();
