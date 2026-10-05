import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountService } from '../services/AccountService';
import type { IAccountRepository } from '../repositories/AccountRepository';
import type { Account } from '../types/account.types';

function makeAccount(id: string, position: number): Account {
  return {
    id,
    workspaceId: 'ws1',
    name: id,
    emoji: '💵',
    type: 'cash',
    currency: 'COP',
    currentBalance: 0,
    color: null,
    position,
  };
}

describe('AccountService', () => {
  let repo: IAccountRepository;
  let service: AccountService;

  beforeEach(() => {
    repo = {
      list: vi.fn().mockResolvedValue([makeAccount('a', 0), makeAccount('b', 1)]),
      create: vi.fn().mockResolvedValue(makeAccount('c', 2)),
      update: vi.fn().mockResolvedValue(makeAccount('a', 0)),
      softDelete: vi.fn().mockResolvedValue(undefined),
    };
    service = new AccountService(repo);
  });

  it('asigna la posición siguiente al crear', async () => {
    await service.create('ws1', { name: 'Nueva', emoji: '🏦', type: 'bank', currency: 'USD' });
    expect(repo.create).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ currency: 'USD', position: 2 }),
    );
  });

  it('elimina con soft delete', async () => {
    await service.remove('a');
    expect(repo.softDelete).toHaveBeenCalledWith('a');
  });
});
