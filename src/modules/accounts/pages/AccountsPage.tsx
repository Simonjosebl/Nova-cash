import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatMoney } from '@/shared/utils/money';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useAccounts, useArchivedAccounts } from '../hooks/useAccounts';
import { useReorderAccounts } from '../hooks/useAccountMutations';
import { AccountCard } from '../components/AccountCard';
import { AccountFormSheet } from '../components/AccountFormSheet';
import type { Account } from '../types/account.types';

/** Cuentas (Cap. 6.8): lista, saldo total, crear/editar/archivar/eliminar/reordenar. */
export function AccountsPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';

  const { data: accounts = [], isLoading } = useAccounts(workspaceId);
  const { data: archived = [] } = useArchivedAccounts(workspaceId);
  const reorder = useReorderAccounts(workspaceId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>(undefined);

  const total = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const openCreate = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (account: Account) => {
    setEditing(account);
    setSheetOpen(true);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= accounts.length) return;
    const ids = accounts.map((a) => a.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorder.mutate(ids);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
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
        <p className="text-h1 font-bold text-primary">{formatMoney(total, currency)}</p>
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
          {accounts.map((account, index) => (
            <AccountCard
              key={account.id}
              account={account}
              canEdit={canEdit}
              onEdit={openEdit}
              onMove={(dir) => move(index, dir)}
              isFirst={index === 0}
              isLast={index === accounts.length - 1}
            />
          ))}
        </section>
      )}

      {canEdit && accounts.length > 0 ? (
        <Button variant="secondary" onClick={openCreate}>
          <Plus />
          Nueva cuenta
        </Button>
      ) : null}

      {archived.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
            Archivadas
          </h2>
          {archived.map((account) => (
            <AccountCard key={account.id} account={account} canEdit={canEdit} onEdit={openEdit} />
          ))}
        </section>
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
    </main>
  );
}
