import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatMoney } from '@/shared/utils/money';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useAccounts } from '../hooks/useAccounts';
import { balanceTotals } from '../utils/balanceTotals';
import { AccountCard } from '../components/AccountCard';
import { AccountFormSheet } from '../components/AccountFormSheet';
import type { Account } from '../types/account.types';

/** Cuentas (Cap. 6.8 / R-09): lista, saldo por moneda, crear/editar/eliminar. */
export function AccountsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';

  const { data: accounts = [], isLoading } = useAccounts(workspaceId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>(undefined);

  const [primary, ...others] = balanceTotals(accounts, currency);

  const openCreate = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (account: Account) => {
    setEditing(account);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Cuentas</h1>
      </header>

      <div>
        <p className="text-caption text-muted-foreground">Saldo total</p>
        <p className="text-h1 font-bold text-primary">
          {formatMoney(primary?.total ?? 0, currency)}
        </p>
        {others.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map((t) => (
              <span
                key={t.currency}
                className="rounded-full bg-secondary px-3 py-1 text-caption font-medium text-foreground"
              >
                {formatMoney(t.total, t.currency)} · {t.currency}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          emoji="🏦"
          title="Aún no tienes cuentas"
          description="Crea tu primera cuenta para registrar dónde está tu dinero."
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus />
                Nueva cuenta
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section className="flex flex-col gap-2">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} canEdit={canEdit} onEdit={openEdit} />
          ))}
        </section>
      )}

      {canEdit && accounts.length > 0 ? (
        <Button variant="secondary" onClick={openCreate}>
          <Plus />
          Nueva cuenta
        </Button>
      ) : null}

      {canEdit ? (
        <AccountFormSheet
          key={editing?.id ?? 'new'}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          workspaceId={workspaceId}
          currency={currency}
          account={editing}
        />
      ) : null}
    </div>
  );
}
