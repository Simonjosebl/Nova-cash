import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEscapeToClose } from '@/shared/hooks/useEscapeToClose';
import { Button } from './button';

export interface ConfirmOptions {
  title: string;
  description?: string;
  /** Emoji de identidad del diálogo (Cap. 3 — emojis como identidad). */
  emoji?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` para acciones destructivas (botón rojo). */
  tone?: 'danger' | 'primary';
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación (Cap. 3 — Modal / R-07). Reemplaza a los diálogos nativos del
 * navegador. Se cierra con Escape o tocando el fondo; el foco inicia en "Cancelar".
 */
export function ConfirmDialog({
  open,
  title,
  description,
  emoji = '🗑️',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEscapeToClose(open, onCancel);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.button
            aria-label="Cerrar"
            className="absolute inset-0 bg-nova-navy/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={description ? 'confirm-description' : undefined}
            className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 rounded-xl bg-card p-6 text-center shadow-modal"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          >
            <span
              aria-hidden
              className={
                tone === 'danger'
                  ? 'flex size-14 items-center justify-center rounded-full bg-destructive/10 text-2xl'
                  : 'flex size-14 items-center justify-center rounded-full bg-accent/10 text-2xl'
              }
            >
              {emoji}
            </span>
            <div className="flex flex-col gap-2">
              <h2 id="confirm-title" className="text-title font-semibold text-foreground">
                {title}
              </h2>
              {description ? (
                <p id="confirm-description" className="text-caption text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button variant={tone} size="sm" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
