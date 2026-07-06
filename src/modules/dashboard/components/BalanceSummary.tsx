import { Card } from '@/shared/ui/card';
import { formatMoney } from '@/shared/utils/money';
import type { DashboardSummary } from '../types/dashboard.types';

/** Saldo (elemento visual más importante) + resumen de tres tarjetas (Cap. 3.16). */
export function BalanceSummary({
  balance,
  summary,
  currency,
}: {
  balance: number;
  summary: DashboardSummary;
  currency: string;
}) {
  const items = [
    { emoji: '💰', label: 'Ingresos', value: summary.income },
    { emoji: '💸', label: 'Gastos', value: summary.expense },
    { emoji: '📈', label: 'Disponible', value: summary.available },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-caption text-muted-foreground">Saldo disponible</p>
        <p className="text-display font-bold text-primary">{formatMoney(balance, currency)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <Card key={it.label} className="p-4">
            <span className="text-xl">{it.emoji}</span>
            <p className="mt-1 text-small text-muted-foreground">{it.label}</p>
            <p className="text-caption font-semibold text-foreground">
              {formatMoney(it.value, currency)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
