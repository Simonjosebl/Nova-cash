import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isAppError } from '@/shared/types/app-error';
import { ReminderService } from '../services/ReminderService';
import type { IReminderRepository } from '../repositories/ReminderRepository';
import type { IReminder, SaveReminderDTO } from '../types/reminder.types';

const reminder = (id: string): IReminder => ({
  id,
  workspaceId: 'ws1',
  kind: 'any',
  time: '20:00',
  days: [1, 2, 3, 4, 5, 6, 7],
  enabled: true,
});

describe('ReminderService', () => {
  let repo: IReminderRepository;
  let service: ReminderService;
  const dto: SaveReminderDTO = { kind: 'expense', time: '21:30', days: [1, 3], enabled: true };

  beforeEach(() => {
    repo = {
      list: vi.fn().mockResolvedValue([reminder('a')]),
      create: vi.fn().mockResolvedValue(reminder('b')),
      update: vi.fn().mockResolvedValue(reminder('a')),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    service = new ReminderService(repo);
  });

  it('crea un recordatorio en el espacio', async () => {
    await service.create('ws1', dto);
    expect(repo.create).toHaveBeenCalledWith('ws1', dto);
  });

  it('limita la cantidad de recordatorios (sin spam)', async () => {
    vi.mocked(repo.list).mockResolvedValue(['1', '2', '3', '4', '5'].map(reminder));
    await expect(service.create('ws1', dto)).rejects.toSatisfy(
      (e) => isAppError(e) && e.code === 'REMINDER_LIMIT',
    );
  });

  it('activa y desactiva', async () => {
    await service.setEnabled('a', false);
    expect(repo.update).toHaveBeenCalledWith('a', { enabled: false });
  });
});
