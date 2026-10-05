import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { REGISTERABLE_TYPES } from '@/modules/transactions/constants/transaction.constants';
import type { TransactionType } from '@/modules/transactions/types/transaction.types';

interface AddMovementSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: TransactionType) => void;
}

/** Menú del FAB (Cap. 6.6): ¿Qué deseas registrar? Solo gasto o ingreso. */
export function AddMovementSheet({ open, onClose, onSelect }: AddMovementSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="¿Qué deseas registrar?">
      <div className="flex flex-col gap-2">
        {REGISTERABLE_TYPES.map((a) => (
          <button
            key={a.type}
            type="button"
            onClick={() => onSelect(a.type)}
            className="flex items-center gap-3 rounded-md border border-input bg-card px-4 py-3 text-left shadow-card-glow active:scale-[0.99] dark:shadow-card-glow-dark"
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="flex-1 text-body font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
