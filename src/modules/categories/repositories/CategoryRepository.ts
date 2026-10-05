import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type {
  Category,
  CategoryType,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../types/category.types';

const COLS = 'id,workspace_id,emoji,name,type,color,position,is_default';

interface CategoryRow {
  id: string;
  workspace_id: string;
  emoji: string;
  name: string;
  type: CategoryType;
  color: string | null;
  position: number;
  is_default: boolean;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    emoji: row.emoji,
    name: row.name,
    type: row.type,
    color: row.color,
    position: row.position,
    isDefault: row.is_default,
  };
}

export interface CreateCategoryParams extends CreateCategoryDTO {
  position: number;
}

export interface ICategoryRepository {
  list(workspaceId: string): Promise<Category[]>;
  create(workspaceId: string, params: CreateCategoryParams): Promise<Category>;
  update(id: string, dto: UpdateCategoryDTO): Promise<Category>;
  softDelete(id: string): Promise<void>;
  setPosition(id: string, position: number): Promise<void>;
}

export class CategoryRepository implements ICategoryRepository {
  async list(workspaceId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .order('type', { ascending: true })
      .order('position', { ascending: true });
    if (error) throw toAppError(error, 'No pudimos cargar las categorías.');
    return ((data ?? []) as CategoryRow[]).map(mapCategory);
  }

  async create(workspaceId: string, params: CreateCategoryParams): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        workspace_id: workspaceId,
        name: params.name,
        emoji: params.emoji,
        type: params.type,
        position: params.position,
      })
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear la categoría.');
    return mapCategory(data as CategoryRow);
  }

  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(dto)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar la categoría.');
    return mapCategory(data as CategoryRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_record', { p_table: 'categories', p_id: id });
    if (error) throw toAppError(error, 'No pudimos eliminar la categoría.');
  }

  async setPosition(id: string, position: number): Promise<void> {
    const { error } = await supabase.from('categories').update({ position }).eq('id', id);
    if (error) throw toAppError(error, 'No pudimos reordenar las categorías.');
  }
}

export const categoryRepository = new CategoryRepository();
