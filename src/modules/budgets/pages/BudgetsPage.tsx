import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { formatMoney } from '@/shared/utils/money';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/lib/utils';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetFormSheet } from '../components/BudgetFormSheet';
import {
  BUDGET_STATUS_BAR,
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_TEXT,
} from '../constants/budget.constants';
import type { BudgetProgress } from '../types/budget.types';

/** Presupuestos (Cap. 6.12): progreso por categoría con estados. */
export function BudgetsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';

  const { data: budgets = [], isLoading } = useBudgets(workspaceId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetProgress | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Presupuestos</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="Sin presupuestos"
          description="Define cuánto quieres gastar por categoría y te avisamos al acercarte."
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus />
                Nuevo presupuesto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section className="flex flex-col gap-3">
          {budgets.map((b) => (
            <Card key={b.id} className="flex flex-col gap-2 p-4">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  setEditing(b);
                  setSheetOpen(true);
                }}
                className="flex items-center gap-3 text-left"
              >
                <span className="text-2xl">{b.categoryEmoji}</span>
                <span className="flex-1 text-body font-medium text-foreground">
                  {b.categoryName}
                </span>
                <span className={cn('text-caption font-semibold', BUDGET_STATUS_TEXT[b.status])}>
                  {b.percent}%
                </span>
              </button>
              <ProgressBar percent={b.percent} barClass={BUDGET_STATUS_BAR[b.status]} />
              <div className="flex justify-between text-caption text-muted-foreground">
                <span>
                  {formatMoney(b.spent, currency)} de {formatMoney(b.amount, currency)}
                </span>
                <span className={BUDGET_STATUS_TEXT[b.status]}>
                  {BUDGET_STATUS_LABELS[b.status]}
                </span>
              </div>
            </Card>
          ))}
        </section>
      )}

      {canEdit && budgets.length > 0 ? (
        <Button variant="secondary" onClick={openCreate}>
          <Plus />
          Nuevo presupuesto
        </Button>
      ) : null}

      {canEdit ? (
        <BudgetFormSheet
          key={editing?.id ?? 'new'}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          workspaceId={workspaceId}
          currency={currency}
          budget={editing}
          takenCategoryIds={budgets.map((b) => b.categoryId)}
        />
      ) : null}
    </main>
  );
}
