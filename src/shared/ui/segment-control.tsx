import { cn } from '@/lib/utils';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SegmentOption<T>>;
}

/** Segment Control (Cap. 3.14). Alterna entre vistas dentro de una pantalla. */
export function SegmentControl<T extends string>({
  value,
  onChange,
  options,
}: SegmentControlProps<T>) {
  return (
    <div className="flex rounded-md bg-secondary p-1" role="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-sm py-2 text-caption font-medium transition-all',
              active ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
