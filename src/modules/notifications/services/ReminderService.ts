import { AppError } from '@/shared/types/app-error';
import { reminderRepository, type IReminderRepository } from '../repositories/ReminderRepository';
import { MAX_REMINDERS } from '../constants/reminder.constants';
import type { IReminder, SaveReminderDTO } from '../types/reminder.types';

/**
 * ReminderService — recordatorios para registrar gastos e ingresos (R-13).
 * El envío lo hace el servidor (pg_cron) a la hora local del usuario.
 */
export class ReminderService {
  constructor(private readonly repo: IReminderRepository = reminderRepository) {}

  list(workspaceId: string): Promise<IReminder[]> {
    return this.repo.list(workspaceId);
  }

  /** Crea un recordatorio respetando el máximo por espacio (nunca spam — Cap. 4.20). */
  async create(workspaceId: string, dto: SaveReminderDTO): Promise<IReminder> {
    const existing = await this.repo.list(workspaceId);
    if (existing.length >= MAX_REMINDERS) {
      throw new AppError(
        'REMINDER_LIMIT',
        `Puedes tener hasta ${MAX_REMINDERS} recordatorios. Edita o elimina uno.`,
      );
    }
    return this.repo.create(workspaceId, dto);
  }

  update(id: string, dto: Partial<SaveReminderDTO>): Promise<IReminder> {
    return this.repo.update(id, dto);
  }

  setEnabled(id: string, enabled: boolean): Promise<IReminder> {
    return this.repo.update(id, { enabled });
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}

export const reminderService = new ReminderService();
