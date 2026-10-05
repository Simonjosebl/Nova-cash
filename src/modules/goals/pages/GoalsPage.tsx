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
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useGoals } from '../hooks/useGoals';
import { GoalFormSheet } from '../components/GoalFormSheet';
import { GoalDetailSheet } from '../components/GoalDetailSheet';
import type { Goal, GoalProgress } from '../types/goal.types';

/** Metas (Cap. 6.13): progreso de ahorro; nunca solo el porcentaje. */
export function GoalsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';

  const { data: goals = [], isLoading } = useGoals(workspaceId);
  const [formGoal, setFormGoal] = useState<Goal | 'new' | null>(null);
  const [detail, setDetail] = useState<GoalProgress | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Metas</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="Sin metas todavía"
          description="Crea una meta de ahorro y sigue tu progreso paso a paso."
          action={
            canEdit ? (
              <Button onClick={() => setFormGoal('new')}>
                <Plus />
                Nueva meta
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section className="flex flex-col gap-3">
          {goals.map((g) => (
            <Card key={g.id} className="flex flex-col gap-2 p-4">
              <button
                type="button"
                onClick={() => setDetail(g)}
                className="flex items-center gap-3 text-left"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="flex-1 text-body font-medium text-foreground">{g.name}</span>
                <span className="text-caption font-semibold text-success">{g.percent}%</span>
              </button>
              <ProgressBar percent={g.percent} barClass="bg-success" />
              <p className="text-caption text-muted-foreground">
                {formatMoney(g.currentAmount, currency)} de {formatMoney(g.targetAmount, currency)}
              </p>
            </Card>
          ))}
        </section>
      )}

      {canEdit && goals.length > 0 ? (
        <Button variant="secondary" onClick={() => setFormGoal('new')}>
          <Plus />
          Nueva meta
        </Button>
      ) : null}

      {canEdit && formGoal ? (
        <GoalFormSheet
          key={formGoal === 'new' ? 'new' : formGoal.id}
          open
          onClose={() => setFormGoal(null)}
          workspaceId={workspaceId}
          currency={currency}
          goal={formGoal === 'new' ? undefined : formGoal}
        />
      ) : null}

      {detail ? (
        <GoalDetailSheet
          key={detail.id}
          open
          onClose={() => setDetail(null)}
          workspaceId={workspaceId}
          currency={currency}
          goal={detail}
          canEdit={canEdit}
          onEdit={(g) => {
            setDetail(null);
            setFormGoal(g);
          }}
        />
      ) : null}
    </div>
  );
}
