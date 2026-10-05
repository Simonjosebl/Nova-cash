import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiCatalogSheet } from './emoji-catalog-sheet';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  /** Sugeridos para elegir con un toque; "Más" abre el catálogo completo. */
  emojis: readonly string[];
}

const TILE =
  'flex aspect-square items-center justify-center rounded-sm border text-2xl transition-all active:scale-[0.97]';

/**
 * Selector de emoji (Cap. 3.13 / R-10). Sugeridos del dominio + acceso al catálogo
 * completo de teclado. Si el emoji elegido no está entre los sugeridos, aparece primero.
 */
export function EmojiPicker({ value, onChange, emojis }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const tiles = value && !emojis.includes(value) ? [value, ...emojis] : emojis;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
        {tiles.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            aria-pressed={value === emoji}
            className={cn(
              TILE,
              value === emoji ? 'border-ring bg-secondary' : 'border-input bg-card',
            )}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ver todos los emojis"
          title="Ver todos los emojis"
          className={cn(
            TILE,
            'border-dashed border-input bg-card text-muted-foreground hover:border-ring hover:text-foreground',
          )}
        >
          <Plus className="size-5" />
        </button>
      </div>

      <EmojiCatalogSheet
        open={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}
