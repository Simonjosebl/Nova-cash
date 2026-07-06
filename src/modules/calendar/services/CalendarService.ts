import { AppError } from '@/shared/types/app-error';
import { addMonthsIso, todayIso } from '@/shared/utils/date';
import { transactionService } from '@/modules/transactions/services/TransactionService';
import { calendarRepository, type ICalendarRepository } from '../repositories/CalendarRepository';
import type { CalendarEvent, CreateEventDTO, UpdateEventDTO } from '../types/calendar.types';

/**
 * CalendarService — calendario financiero (Cap. 4.13).
 * Registrar un pago crea la transacción real (cascada de saldos) y marca el evento como pagado.
 * Gastos fijos: al pagar un evento recurrente se genera la ocurrencia del mes siguiente.
 */
export class CalendarService {
  constructor(private readonly repo: ICalendarRepository = calendarRepository) {}

  listRange(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]> {
    return this.repo.listRange(workspaceId, from, to);
  }

  listUpcoming(workspaceId: string, from: string, to: string): Promise<CalendarEvent[]> {
    return this.repo.listUpcoming(workspaceId, from, to);
  }

  async create(workspaceId: string, dto: CreateEventDTO): Promise<CalendarEvent> {
    let recurringId: string | null = null;
    if (dto.repeatMonthly) {
      recurringId = await this.repo.createRecurring(workspaceId, {
        title: dto.title,
        emoji: dto.emoji,
        flow: dto.flow,
        amount: dto.amount,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        nextExecution: addMonthsIso(dto.date, 1),
      });
    }
    return this.repo.createEvent(workspaceId, { ...dto, recurringId });
  }

  update(id: string, dto: UpdateEventDTO): Promise<CalendarEvent> {
    return this.repo.update(id, dto);
  }

  cancel(id: string): Promise<void> {
    return this.repo.setStatus(id, 'cancelled');
  }

  postpone(id: string, newDate: string): Promise<CalendarEvent> {
    return this.repo.update(id, { date: newDate });
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  /**
   * Registra el pago de un evento: crea la transacción y marca el evento como pagado.
   * Si el evento es recurrente, genera la ocurrencia del mes siguiente.
   */
  async registerPayment(event: CalendarEvent, accountId: string): Promise<void> {
    if (!accountId) {
      throw new AppError('NO_ACCOUNT', 'Elige una cuenta para registrar el pago.');
    }
    const tx = await transactionService.create(event.workspaceId, {
      type: event.flow,
      amount: event.amount,
      accountId,
      categoryId: event.categoryId,
      date: todayIso(),
      description: event.title,
    });
    await this.repo.setStatus(event.id, 'paid', tx.id);

    if (event.recurringId) {
      await this.repo.createEvent(event.workspaceId, {
        title: event.title,
        emoji: event.emoji,
        flow: event.flow,
        amount: event.amount,
        accountId: event.accountId,
        categoryId: event.categoryId,
        date: addMonthsIso(event.date, 1),
        recurringId: event.recurringId,
      });
    }
  }
}

export const calendarService = new CalendarService();
