import { createContext, useContext } from 'react';
import type { ConfirmOptions } from '@/shared/ui/confirm-dialog';

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Pide confirmación con el modal de la app (R-07). Resuelve `true` si el usuario confirma.
 * Uso: `if (await confirm({ title: '¿Eliminar esta meta?' })) remove.mutate(id);`
 */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm debe usarse dentro de ConfirmProvider.');
  return confirm;
}
