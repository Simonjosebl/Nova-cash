import { useMemo, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { SegmentControl } from '@/shared/ui/segment-control';
import { Input } from '@/shared/ui/input';
import { formatDateLabel } from '@/shared/utils/date';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionFormSheet } from '../components/TransactionFormSheet';
import type { Transaction, TransactionFilters, TransactionType } from '../types/transaction.types';

type TypeFilter = '' | TransactionType;

/** Movimientos (Cap. 6.15): historial cronológico con filtros. */
export function TransactionsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);

  const filters: TransactionFilters = {
    type: typeFilter || undefined,
    search: search.trim() || undefined,
  };
  const { data: transactions = [], isLoading } = useTransactions(workspaceId, filters);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return Array.from(map.entries());
  }, [transactions]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h3 font-bold text-primary">Movimientos</h1>

      <SegmentControl
        value={typeFilter}
        onChange={setTypeFilter}
        options={[
          { value: '', label: 'Todos' },
          { value: 'expense', label: 'Gastos' },
          { value: 'income', label: 'Ingresos' },
        ]}
      />

      <Input
        placeholder="Buscar por descripción…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          emoji="🧾"
          title="Todavía no tienes movimientos"
          description="Toca el botón + para registrar tu primer gasto o ingreso."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(([date, items]) => (
            <section key={date} className="flex flex-col gap-1">
              <h2 className="px-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDateLabel(date)}
              </h2>
              <Card className="flex flex-col gap-1 p-2">
                {items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    currency={currency}
                    onClick={setEditing}
                  />
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}

      {active && editing ? (
        <TransactionFormSheet
          key={editing.id}
          open
          onClose={() => setEditing(undefined)}
          workspaceId={active.id}
          currency={active.currency}
          initialType={editing.type}
          transaction={editing}
        />
      ) : null}
    </div>
  );
}
