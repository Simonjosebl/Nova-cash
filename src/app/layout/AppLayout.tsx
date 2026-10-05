import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Fab } from '@/shared/ui/fab';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { TransactionFormSheet } from '@/modules/transactions/components/TransactionFormSheet';
import type { TransactionType } from '@/modules/transactions/types/transaction.types';
import { BottomTab } from './BottomTab';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AddMovementSheet } from './AddMovementSheet';

/**
 * Shell de la app (Cap. 3.20 / 6.21 / R-06). Móvil: contenido + FAB + Bottom Tab.
 * Computador: barra lateral (con su botón de registro) + contenido ancho.
 * El FAB abre el menú de registro y luego el formulario de movimiento.
 */
export function AppLayout() {
  const { active } = useActiveWorkspace();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType | null>(null);

  return (
    <div className="relative min-h-dvh bg-background">
      <Sidebar onAdd={() => setActionsOpen(true)} />

      <div className="lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-md px-6 pb-36 pt-6 md:max-w-2xl lg:max-w-4xl lg:px-10 lg:pb-16 lg:pt-4">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 lg:hidden">
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
