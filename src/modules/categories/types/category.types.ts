export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  workspaceId: string;
  emoji: string;
  name: string;
  type: CategoryType;
  color: string | null;
  position: number;
  isDefault: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  emoji: string;
  type: CategoryType;
}

export interface UpdateCategoryDTO {
  name?: string;
  emoji?: string;
  type?: CategoryType;
}
