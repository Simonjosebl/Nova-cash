import { describe, it, expect, vi } from 'vitest';
import { NotificationService } from '../services/NotificationService';
import { WebPushService } from '../services/PushService';
import type { INotificationRepository } from '../repositories/NotificationRepository';
import type { AppNotification } from '../types/notification.types';

function notif(id: string, read: boolean): AppNotification {
  return { id, title: id, message: '', priority: 'info', type: 'general', read, createdAt: '' };
}

describe('NotificationService', () => {
  const repo: INotificationRepository = {
    list: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    remove: vi.fn(),
  };
  const service = new NotificationService(repo);

  it('cuenta las no leídas', () => {
    const list = [notif('a', false), notif('b', true), notif('c', false)];
    expect(service.unreadCount(list)).toBe(2);
  });

  it('delega marcar todas como leídas', async () => {
    await service.markAllRead('ws1');
    expect(repo.markAllRead).toHaveBeenCalledWith('ws1');
  });
});

describe('WebPushService', () => {
  it('reporta push no soportado en web', async () => {
    const push = new WebPushService();
    expect(push.isSupported()).toBe(false);
    await expect(push.register()).resolves.toBe('unsupported');
  });
});
