import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { formatMoney } from '@/shared/utils/money';
import type {
  DashboardActivityItem,
  DashboardCategory,
  DashboardUpcomingPayment,
} from '../types/dashboard.types';

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function dueLabel(dueInDays: number): string {
  if (dueInDays <= 0) return 'Hoy';
  if (dueInDays === 1) return 'Mañana';
  return `En ${dueInDays} días`;
}

export function UpcomingPayments({ payments }: { payments: DashboardUpcomingPayment[] }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Próximos pagos</SectionTitle>
      {payments.length === 0 ? (
        <Card>
          <EmptyState
            emoji="📅"
            title="Sin pagos programados"
            description="Programa un pago recurrente para no olvidarlo."
          />
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-xl">{p.emoji}</span>
              <span className="flex-1 text-body text-foreground">{p.name}</span>
              <span className="text-caption text-muted-foreground">{dueLabel(p.dueInDays)}</span>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}

export function CategoriesList({
  categories,
  currency,
}: {
  categories: DashboardCategory[];
  currency: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Categorías</SectionTitle>
      {categories.length === 0 ? (
        <Card>
          <EmptyState
            emoji="🍔"
            title="Aún sin categorías"
            description="Verás aquí en qué se va tu dinero."
          />
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-xl">{c.emoji}</span>
              <span className="flex-1 text-body text-foreground">{c.name}</span>
              <span className="text-body font-semibold text-foreground">
                {formatMoney(c.amount, currency)}
              </span>
              <span className="w-10 text-right text-caption text-muted-foreground">
                {c.percent}%
              </span>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}

export function RecentActivity({
  items,
  currency,
}: {
  items: DashboardActivityItem[];
  currency: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Actividad reciente</SectionTitle>
      {items.length === 0 ? (
        <Card>
          <EmptyState
            emoji="🧾"
            title="Todavía no tienes movimientos"
            description="Agrega tu primer gasto para comenzar."
          />
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <span className="text-xl">{it.emoji}</span>
              <span className="flex-1 text-body text-foreground">{it.name}</span>
              <span className="text-body font-semibold text-foreground">
                {it.type === 'expense' ? '-' : ''}
                {formatMoney(it.amount, currency)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}
