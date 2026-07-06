export type NotificationPriority = 'critical' | 'warning' | 'info' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  type: string;
  read: boolean;
  createdAt: string;
}
