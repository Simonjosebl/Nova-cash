import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../services/TransactionService';
import type { ITransactionRepository } from '../repositories/TransactionRepository';
import type { CreateTransactionDTO } from '../types/transaction.types';

describe('TransactionService', () => {
  let repo: ITransactionRepository;
  let service: TransactionService;

  beforeEach(() => {
    repo = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((_ws, dto) => Promise.resolve({ id: 't1', ...dto })),
      update: vi.fn().mockResolvedValue({ id: 't1' }),
      softDelete: vi.fn().mockResolvedValue(undefined),
    };
    service = new TransactionService(repo);
  });

  it('en transferencia elimina la categoría (RB-007/015)', async () => {
    const dto: CreateTransactionDTO = {
      type: 'transfer',
      amount: 500,
      accountId: 'a1',
      toAccountId: 'a2',
      categoryId: 'should-be-removed',
      date: '2026-07-05',
    };
    await service.create('ws1', dto);
    expect(repo.create).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ categoryId: null, toAccountId: 'a2' }),
    );
  });

  it('en gasto elimina la cuenta destino', async () => {
    const dto: CreateTransactionDTO = {
      type: 'expense',
      amount: 100,
      accountId: 'a1',
      toAccountId: 'a2',
      categoryId: 'c1',
      date: '2026-07-05',
    };
    await service.create('ws1', dto);
    expect(repo.create).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ toAccountId: null, categoryId: 'c1' }),
    );
  });

  it('elimina con soft delete', async () => {
    await service.remove('t1');
    expect(repo.softDelete).toHaveBeenCalledWith('t1');
  });
});
