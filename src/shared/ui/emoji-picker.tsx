import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  emojis: readonly string[];
}

/** Selector de emoji reutilizable (Cap. 3.13 — emojis como identidad). */
export function EmojiPicker({ value, onChange, emojis }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          aria-pressed={value === emoji}
          className={cn(
            'flex h-12 items-center justify-center rounded-sm border text-2xl transition-all active:scale-[0.97]',
            value === emoji ? 'border-ring bg-secondary' : 'border-input bg-card',
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
