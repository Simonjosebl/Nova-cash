import { cn } from '@/lib/utils';
import { SUGGESTED_EMOJIS } from '../constants/workspace.constants';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

/** Selector rápido de emoji (Cap. 3.13 — emojis como identidad, no iconos). */
export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {SUGGESTED_EMOJIS.map((emoji) => (
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
