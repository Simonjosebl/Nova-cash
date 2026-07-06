import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

/**
 * Floating Action Button (Cap. 3 — único en la app, centro inferior,
 * gradiente Nova Blue → Nova Cyan).
 */
export function Fab({ onClick, label = 'Registrar movimiento', className }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex size-14 items-center justify-center rounded-full text-white shadow-modal transition-transform active:scale-[0.95]',
        'bg-gradient-to-br from-nova-blue to-nova-cyan',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <Plus className="size-7" />
    </button>
  );
}
