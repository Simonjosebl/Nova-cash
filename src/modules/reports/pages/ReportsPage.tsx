import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { SegmentControl } from '@/shared/ui/segment-control';
import { formatMoney } from '@/shared/utils/money';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useReport } from '../hooks/useReport';
import { DonutChart } from '../components/DonutChart';
import { TrendChart } from '../components/TrendChart';
import { PERIOD_OPTIONS } from '../constants/report.constants';
import type { ReportPeriod } from '../types/report.types';

/** Reportes (Cap. 6.14): resumen, tendencia y gasto por categoría. */
export function ReportsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const [period, setPeriod] = useState<ReportPeriod>('this_month');

  const { data, isLoading } = useReport(workspaceId, currency, period);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h3 font-bold text-primary">Reportes</h1>

      <SegmentControl value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />

      {isLoading || !data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : data.income === 0 && data.expense === 0 ? (
        <EmptyState
          emoji="📊"
          title="Sin datos en el periodo"
          description="Registra movimientos para ver tus reportes."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4">
              <p className="text-small text-muted-foreground">Ingresos</p>
              <p className="text-caption font-semibold text-success">
                {formatMoney(data.income, currency)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-small text-muted-foreground">Gastos</p>
              <p className="text-caption font-semibold text-foreground">
                {formatMoney(data.expense, currency)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-small text-muted-foreground">Balance</p>
              <p className="text-caption font-semibold text-primary">
                {formatMoney(data.balance, currency)}
              </p>
            </Card>
          </div>

          <Card className="flex flex-col gap-3">
            <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Tendencia
            </h2>
            <TrendChart points={data.trend} />
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Gasto por categoría
            </h2>
            <DonutChart slices={data.expenseByCategory} currency={currency} />
          </Card>
        </>
      )}
    </div>
  );
}
