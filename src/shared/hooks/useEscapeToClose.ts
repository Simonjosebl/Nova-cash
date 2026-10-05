import { useEffect, useRef } from 'react';

/** Overlays abiertos, del más antiguo al más reciente. Solo el último responde a Escape. */
const overlayStack: symbol[] = [];

/**
 * Cierra el overlay con Escape (R-07). Con varios abiertos (sheet → selector → confirmación),
 * solo se cierra el de más arriba.
 */
export function useEscapeToClose(open: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const token = Symbol('overlay');
    overlayStack.push(token);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && overlayStack[overlayStack.length - 1] === token) {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      overlayStack.splice(overlayStack.indexOf(token), 1);
    };
  }, [open]);
}
