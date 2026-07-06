import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/CategoryService';
import { categoriesKey } from './useCategories';
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';

function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: categoriesKey(workspaceId) });
}

export function useCreateCategory(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(workspaceId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoryService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: invalidate,
  });
}

export function useReorderCategories(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (orderedIds: string[]) => categoryService.reorder(orderedIds),
    onSuccess: invalidate,
  });
}
