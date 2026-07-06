import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface AmountInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

/** Amount Input (Cap. 3.14). Monto numérico con la moneda como prefijo. */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label, value, onChange, currency = 'COP', error, disabled, id }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div
          className={cn(
            'flex h-[52px] items-center rounded-md border border-input bg-card px-4',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
            error ? 'border-destructive' : '',
            disabled ? 'opacity-50' : '',
          )}
        >
          <span className="mr-2 text-body text-muted-foreground">{currency}</span>
          <input
            ref={ref}
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            disabled={disabled}
            value={Number.isNaN(value) ? '' : value}
            onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full bg-transparent text-body text-foreground outline-none disabled:cursor-not-allowed"
          />
        </div>
        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
AmountInput.displayName = 'AmountInput';
