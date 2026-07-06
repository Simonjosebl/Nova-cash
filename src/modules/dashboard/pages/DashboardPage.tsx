import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { EmptyState } from '@/shared/ui/empty-state';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardHeader } from '../components/DashboardHeader';
import { InsightCard } from '../components/InsightCard';
import { BalanceSummary } from '../components/BalanceSummary';
import { CategoriesList, RecentActivity, UpcomingPayments } from '../components/DashboardSections';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

/** Dashboard (Cap. 3.16 / 4.16 / 6.6) — ADR-059: el centro de la experiencia. */
export function DashboardPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const { data, isLoading, isError } = useDashboard(workspaceId, currency);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <EmptyState
          emoji="⚠️"
          title="No pudimos cargar tu resumen"
          description="Intenta nuevamente en un momento."
        />
      ) : (
        <>
          {data.insights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} primary={index === 0} />
          ))}

          <BalanceSummary balance={data.balance} summary={data.summary} currency={currency} />
          <UpcomingPayments payments={data.upcomingPayments} />
          <CategoriesList categories={data.categories} currency={currency} />
          <RecentActivity items={data.recentActivity} currency={currency} />
        </>
      )}
    </div>
  );
}
