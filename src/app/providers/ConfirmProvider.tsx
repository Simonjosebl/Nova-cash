import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ConfirmContext, type ConfirmFn } from '@/shared/hooks/useConfirm';
import { ConfirmDialog, type ConfirmOptions } from '@/shared/ui/confirm-dialog';

/** Monta un único modal de confirmación para toda la app (R-07). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    resolverRef.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const onConfirm = useCallback(() => settle(true), [settle]);
  const onCancel = useCallback(() => settle(false), [settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={options !== null}
        title={options?.title ?? ''}
        {...options}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </ConfirmContext.Provider>
  );
}
