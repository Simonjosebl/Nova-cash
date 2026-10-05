import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface PercentInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
}

const MAX_PERCENT = 100;

/**
 * Campo de porcentaje (Cap. 3.14). El símbolo % va pegado al número y lo sigue
 * mientras se escribe. Solo enteros entre 0 y 100.
 */
export const PercentInput = React.forwardRef<HTMLInputElement, PercentInputProps>(
  ({ label, value, onChange, error, disabled, id, hint }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const text = Number.isFinite(value) && value > 0 ? String(value) : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
      onChange(digits === '' ? 0 : Math.min(Number(digits), MAX_PERCENT));
    };

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div
          onClick={() => inputRef.current?.focus()}
          className={cn(
            'flex h-[52px] cursor-text items-center rounded-md border border-input bg-card px-4 text-body',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
            error ? 'border-destructive' : '',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          )}
        >
          <input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            disabled={disabled}
            value={text}
            onChange={handleChange}
            aria-invalid={!!error}
            style={{ width: `${Math.max(text.length, 1)}ch` }}
            className="bg-transparent tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
          <span
            aria-hidden
            className={cn('ml-0.5', text ? 'text-foreground' : 'text-muted-foreground')}
          >
            %
          </span>
        </div>
        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p className="text-caption text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  },
);
PercentInput.displayName = 'PercentInput';
