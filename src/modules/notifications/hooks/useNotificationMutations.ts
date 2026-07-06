import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/NotificationService';
import { notificationsKey } from './useNotifications';

function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationsKey(workspaceId) });
}

export function useMarkNotificationRead(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: () => notificationService.markAllRead(workspaceId),
    onSuccess: invalidate,
  });
}

export function useDeleteNotification(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: invalidate,
  });
}
