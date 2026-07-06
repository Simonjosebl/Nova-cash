import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/NotificationService';

export const notificationsKey = (workspaceId: string) => ['notifications', workspaceId] as const;

export function useNotifications(workspaceId: string) {
  return useQuery({
    queryKey: notificationsKey(workspaceId),
    queryFn: () => notificationService.list(workspaceId),
    enabled: !!workspaceId,
  });
}
