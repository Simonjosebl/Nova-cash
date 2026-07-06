import { describe, it, expect, vi, beforeEach } from 'vitest';

const createTransaction = vi.fn().mockResolvedValue({ id: 'tx9' });
vi.mock('@/modules/transactions/services/TransactionService', () => ({
  transactionService: { create: (...args: unknown[]) => createTransaction(...args) },
}));

import { CalendarService } from '../services/CalendarService';
import type { ICalendarRepository } from '../repositories/CalendarRepository';
import type { CalendarEvent } from '../types/calendar.types';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'e1',
    workspaceId: 'ws1',
    recurringId: null,
    transactionId: null,
    title: 'Arriendo',
    emoji: '🏠',
    flow: 'expense',
    amount: 1000,
    accountId: 'a1',
    categoryId: 'c1',
    date: '2026-07-05',
    status: 'pending',
    notes: null,
    ...overrides,
  };
}

describe('CalendarService', () => {
  let repo: ICalendarRepository;
  let service: CalendarService;

  beforeEach(() => {
    createTransaction.mockClear();
    repo = {
      listRange: vi.fn().mockResolvedValue([]),
      listUpcoming: vi.fn().mockResolvedValue([]),
      createEvent: vi.fn().mockImplementation((_ws, p) => Promise.resolve(makeEvent(p))),
      createRecurring: vi.fn().mockResolvedValue('rec1'),
      update: vi.fn().mockResolvedValue(makeEvent()),
      setStatus: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn().mockResolvedValue(undefined),
    };
    service = new CalendarService(repo);
  });

  it('crea plantilla recurrente cuando repeatMonthly es true', async () => {
    await service.create('ws1', {
      title: 'Netflix',
      emoji: '🎬',
      flow: 'expense',
      amount: 30000,
      date: '2026-07-05',
      repeatMonthly: true,
    });
    expect(repo.createRecurring).toHaveBeenCalled();
    expect(repo.createEvent).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ recurringId: 'rec1' }),
    );
  });

  it('no crea plantilla cuando no es recurrente', async () => {
    await service.create('ws1', {
      title: 'Cena',
      emoji: '🍔',
      flow: 'expense',
      amount: 50000,
      date: '2026-07-05',
    });
    expect(repo.createRecurring).not.toHaveBeenCalled();
    expect(repo.createEvent).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ recurringId: null }),
    );
  });

  it('registrar pago crea la transacción y marca el evento como pagado', async () => {
    await service.registerPayment(makeEvent(), 'a1');
    expect(createTransaction).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ type: 'expense', amount: 1000, accountId: 'a1' }),
    );
    expect(repo.setStatus).toHaveBeenCalledWith('e1', 'paid', 'tx9');
  });

  it('registrar pago recurrente genera la ocurrencia del mes siguiente', async () => {
    await service.registerPayment(makeEvent({ recurringId: 'rec1' }), 'a1');
    expect(repo.createEvent).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ recurringId: 'rec1', date: '2026-08-05' }),
    );
  });

  it('rechaza registrar sin cuenta', async () => {
    await expect(service.registerPayment(makeEvent(), '')).rejects.toThrow();
  });
});
