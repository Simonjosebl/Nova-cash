import type { MonthPoint } from '../types/report.types';

/** Alto de una barra en %; un valor mayor a 0 siempre se ve (mínimo 2%). */
function barHeight(value: number, max: number): string {
  if (value <= 0) return '0%';
  return `${Math.max(2, (value / max) * 100)}%`;
}

/** Tendencia ingresos vs gastos por mes (Cap. 6.14). Barras simples en CSS. */
export function TrendChart({ points }: { points: MonthPoint[] }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));

  return (
    <div>
      <div className="flex h-48 gap-3">
        {points.map((p) => (
          <div key={p.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1">
              <div
                className="w-1/3 max-w-6 rounded-t-md bg-success transition-[height] duration-500"
                style={{ height: barHeight(p.income, max) }}
                title={`Ingresos: ${p.income}`}
              />
              <div
                className="w-1/3 max-w-6 rounded-t-md bg-primary transition-[height] duration-500"
                style={{ height: barHeight(p.expense, max) }}
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
