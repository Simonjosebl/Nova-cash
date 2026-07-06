import { categoryRepository, type ICategoryRepository } from '../repositories/CategoryRepository';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.types';

/**
 * CategoryService — lógica de categorías (ADR-009). Posición por tipo, soft delete, reordenar.
 */
export class CategoryService {
  constructor(private readonly repo: ICategoryRepository = categoryRepository) {}

  list(workspaceId: string): Promise<Category[]> {
    return this.repo.list(workspaceId);
  }

  async create(workspaceId: string, dto: CreateCategoryDTO): Promise<Category> {
    const all = await this.repo.list(workspaceId);
    const position = all.filter((c) => c.type === dto.type).length;
    return this.repo.create(workspaceId, { ...dto, position });
  }

  update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    return this.repo.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  /** Reordena una lista de ids (posición = índice, dentro de un mismo tipo). */
  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(orderedIds.map((id, index) => this.repo.setPosition(id, index)));
  }
}

export const categoryService = new CategoryService();
