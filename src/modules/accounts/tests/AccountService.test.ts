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
    openingBalance: 0,
    currentBalance: 0,
    color: null,
    position,
    isArchived: false,
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
      setArchived: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn().mockResolvedValue(undefined),
      setPosition: vi.fn().mockResolvedValue(undefined),
    };
    service = new AccountService(repo);
  });

  it('asigna la posición siguiente al crear', async () => {
    await service.create('ws1', 'COP', {
      name: 'Nueva',
      emoji: '🏦',
      type: 'bank',
      openingBalance: 500,
    });
    expect(repo.create).toHaveBeenCalledWith(
      'ws1',
      expect.objectContaining({ currency: 'COP', position: 2, openingBalance: 500 }),
    );
  });

  it('reordena asignando posición por índice', async () => {
    await service.reorder(['b', 'a', 'c']);
    expect(repo.setPosition).toHaveBeenCalledWith('b', 0);
    expect(repo.setPosition).toHaveBeenCalledWith('a', 1);
    expect(repo.setPosition).toHaveBeenCalledWith('c', 2);
  });

  it('archiva y desarchiva', async () => {
    await service.archive('a');
    expect(repo.setArchived).toHaveBeenCalledWith('a', true);
    await service.unarchive('a');
    expect(repo.setArchived).toHaveBeenCalledWith('a', false);
  });

  it('elimina con soft delete', async () => {
    await service.remove('a');
    expect(repo.softDelete).toHaveBeenCalledWith('a');
  });
});
