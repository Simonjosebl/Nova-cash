import { formatMoney } from '@/shared/utils/money';
import type { CategorySlice } from '../types/report.types';

/** Donut de gasto por categoría (Cap. 6.14) con conic-gradient — muy simple, sin dependencias. */
export function DonutChart({ slices, currency }: { slices: CategorySlice[]; currency: string }) {
  if (slices.length === 0) {
    return (
      <p className="py-6 text-center text-body text-muted-foreground">Sin gastos en el periodo.</p>
    );
  }

  let acc = 0;
  const stops = slices
    .map((s) => {
      const start = acc;
      acc += s.percent;
      return `${s.color} ${start}% ${acc}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative size-40 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label="Distribución de gastos por categoría"
      >
        <div className="absolute inset-[22%] rounded-full bg-card" />
      </div>

      <ul className="flex w-full flex-col gap-2">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center gap-2 text-caption">
            <span className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-foreground">
              {s.emoji} {s.name}
            </span>
            <span className="text-muted-foreground">{s.percent}%</span>
            <span className="w-24 text-right font-medium text-foreground">
              {formatMoney(s.amount, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
