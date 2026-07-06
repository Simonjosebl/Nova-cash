import {
  notificationRepository,
  type INotificationRepository,
} from '../repositories/NotificationRepository';
import type { AppNotification } from '../types/notification.types';

/**
 * NotificationService — centro de notificaciones in-app (Cap. 4.20 / 6.19).
 * La generación ocurre server-side (triggers / Edge Functions, Cap. 5.10/5.15).
 */
export class NotificationService {
  constructor(private readonly repo: INotificationRepository = notificationRepository) {}

  list(workspaceId: string): Promise<AppNotification[]> {
    return this.repo.list(workspaceId);
  }

  markRead(id: string): Promise<void> {
    return this.repo.markRead(id);
  }

  markAllRead(workspaceId: string): Promise<void> {
    return this.repo.markAllRead(workspaceId);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }

  unreadCount(notifications: AppNotification[]): number {
    return notifications.filter((n) => !n.read).length;
  }
}

export const notificationService = new NotificationService();
