import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/CategoryService';

export const categoriesKey = (workspaceId: string) => ['categories', workspaceId] as const;

export function useCategories(workspaceId: string) {
  return useQuery({
    queryKey: categoriesKey(workspaceId),
    queryFn: () => categoryService.list(workspaceId),
    enabled: !!workspaceId,
  });
}
