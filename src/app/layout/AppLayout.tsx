import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Fab } from '@/shared/ui/fab';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { TransactionFormSheet } from '@/modules/transactions/components/TransactionFormSheet';
import type { TransactionType } from '@/modules/transactions/types/transaction.types';
import { BottomTab } from './BottomTab';
import { AddMovementSheet } from './AddMovementSheet';

/**
 * Shell de la app (Cap. 3.20 / 6.21): contenido + FAB (siempre visible) + bottom tab.
 * El FAB abre el menú de registro y luego el formulario de movimiento.
 */
export function AppLayout() {
  const { active } = useActiveWorkspace();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType | null>(null);

  return (
    <div className="relative min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-6 pb-32 pt-6">
        <Outlet />
      </main>

      <div className="fixed bottom-[76px] left-1/2 z-40 -translate-x-1/2">
        <Fab onClick={() => setActionsOpen(true)} />
      </div>

      <BottomTab />

      <AddMovementSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onSelect={(type) => {
          setActionsOpen(false);
          setFormType(type);
        }}
      />

      {active && formType ? (
        <TransactionFormSheet
          key={formType}
          open
          onClose={() => setFormType(null)}
          workspaceId={active.id}
          currency={active.currency}
          initialType={formType}
        />
      ) : null}
    </div>
  );
}
