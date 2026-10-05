import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { SegmentControl } from '@/shared/ui/segment-control';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useCategories } from '../hooks/useCategories';
import { useReorderCategories } from '../hooks/useCategoryMutations';
import { CategoryFormSheet } from '../components/CategoryFormSheet';
import type { Category, CategoryType } from '../types/category.types';

/** Categorías (Cap. 6.9): toggle Gastos/Ingresos, crear/editar/eliminar/reordenar. Solo emojis. */
export function CategoriesPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';

  const { data: categories = [], isLoading } = useCategories(workspaceId);
  const reorder = useReorderCategories(workspaceId);

  const [type, setType] = useState<CategoryType>('expense');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);

  const filtered = categories.filter((c) => c.type === type);

  const openCreate = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setSheetOpen(true);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= filtered.length) return;
    const ids = filtered.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorder.mutate(ids);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Categorías</h1>
      </header>

      <SegmentControl
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: 'Gastos' },
          { value: 'income', label: 'Ingresos' },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🏷️"
          title="Aún sin categorías"
          description="Crea categorías para organizar tu dinero con emojis."
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus />
                Nueva categoría
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section className="flex flex-col gap-2">
          {filtered.map((category, index) => (
            <Card key={category.id} className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => canEdit && openEdit(category)}
                disabled={!canEdit}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="text-2xl">{category.emoji}</span>
                <span className="flex-1 text-body font-medium text-foreground">
                  {category.name}
                </span>
              </button>
              {canEdit ? (
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => move(index, 'up')}
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === filtered.length - 1}
                    onClick={() => move(index, 'down')}
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              ) : null}
            </Card>
          ))}
        </section>
      )}

      {canEdit && filtered.length > 0 ? (
        <Button variant="secondary" onClick={openCreate}>
          <Plus />
          Nueva categoría
        </Button>
      ) : null}

      {canEdit ? (
        <CategoryFormSheet
          key={editing?.id ?? `new-${type}`}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          workspaceId={workspaceId}
          defaultType={type}
          category={editing}
        />
      ) : null}
    </div>
  );
}
