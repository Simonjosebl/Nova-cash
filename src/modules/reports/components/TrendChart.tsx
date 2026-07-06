import type { MonthPoint } from '../types/report.types';

/** Tendencia ingresos vs gastos por mes (Cap. 6.14). Barras simples en CSS. */
export function TrendChart({ points }: { points: MonthPoint[] }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));

  return (
    <div>
      <div className="flex h-40 items-end gap-3">
        {points.map((p) => (
          <div key={p.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/3 rounded-t bg-success"
                style={{ height: `${(p.income / max) * 100}%` }}
                title={`Ingresos: ${p.income}`}
              />
              <div
                className="w-1/3 rounded-t bg-primary"
                style={{ height: `${(p.expense / max) * 100}%` }}
                title={`Gastos: ${p.expense}`}
              />
            </div>
            <span className="text-small capitalize text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-caption text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-success" /> Ingresos
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-primary" /> Gastos
        </span>
      </div>
    </div>
  );
}
