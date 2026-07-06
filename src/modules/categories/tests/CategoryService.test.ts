import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '../services/CategoryService';
import type { ICategoryRepository } from '../repositories/CategoryRepository';
import type { Category } from '../types/category.types';

function cat(id: string, type: Category['type'], position: number): Category {
  return {
    id,
    workspaceId: 'ws1',
    emoji: '🏷️',
    name: id,
    type,
    color: null,
    position,
    isDefault: false,
  };
}

describe('CategoryService', () => {
  let repo: ICategoryRepository;
  let service: CategoryService;

  beforeEach(() => {
    repo = {
      list: vi
        .fn()
        .mockResolvedValue([cat('a', 'expense', 0), cat('b', 'expense', 1), cat('c', 'income', 0)]),
      create: vi.fn().mockResolvedValue(cat('new', 'expense', 2)),
      update: vi.fn().mockResolvedValue(cat('a', 'expense', 0)),
      softDelete: vi.fn().mockResolvedValue(undefined),
      setPosition: vi.fn().mockResolvedValue(undefined),
    };
    service = new CategoryService(repo);
  });

  it('asigna posición según cantidad del MISMO tipo', async () => {
    await service.create('ws1', { name: 'Comida', emoji: '🍔', type: 'expense' });
    expect(repo.create).toHaveBeenCalledWith('ws1', expect.objectContaining({ position: 2 }));
  });

  it('la posición de un nuevo ingreso ignora los gastos', async () => {
    await service.create('ws1', { name: 'Sueldo', emoji: '💰', type: 'income' });
    expect(repo.create).toHaveBeenCalledWith('ws1', expect.objectContaining({ position: 1 }));
  });

  it('reordena por índice', async () => {
    await service.reorder(['b', 'a']);
    expect(repo.setPosition).toHaveBeenCalledWith('b', 0);
    expect(repo.setPosition).toHaveBeenCalledWith('a', 1);
  });

  it('elimina con soft delete', async () => {
    await service.remove('a');
    expect(repo.softDelete).toHaveBeenCalledWith('a');
  });
});
