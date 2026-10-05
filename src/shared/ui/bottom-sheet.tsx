import { type ReactNode } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEscapeToClose } from '@/shared/hooks/useEscapeToClose';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** `lg` ensancha el panel en computador (selectores con mucho contenido). */
  size?: 'md' | 'lg';
}

/**
 * Bottom Sheet (Cap. 3.14 — el componente más usado). Radius superior 32, drag handle,
 * animación spring. Cierre con la X, Escape, el fondo o arrastrando la manija.
 * Encabezado fijo y contenido con scroll. En pantallas ≥ 640 px se centra (R-06 / R-07).
 */
export function BottomSheet({ open, onClose, title, children, size = 'md' }: BottomSheetProps) {
  const dragControls = useDragControls();

  useEscapeToClose(open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            aria-label="Cerrar"
            tabIndex={-1}
            className="absolute inset-0 bg-nova-navy/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative z-10 flex max-h-[90dvh] w-full flex-col',
              size === 'lg' ? 'max-w-md sm:max-w-2xl' : 'max-w-md',
              'overflow-hidden rounded-t-xl bg-card shadow-sheet sm:rounded-xl sm:shadow-modal',
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="h-1.5 w-10 rounded-full bg-muted" aria-hidden />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-4">
              <h2 className="text-title font-semibold text-foreground">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="nova-scroll flex-1 overflow-y-auto px-6 pb-8">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
