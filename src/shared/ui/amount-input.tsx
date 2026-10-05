import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatAmountInput, parseAmountInput } from '@/shared/utils/money';
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

/** Cuántos dígitos hay antes de la posición `caret` (para reubicar el cursor tras formatear). */
function digitsBefore(text: string, caret: number): number {
  return text.slice(0, caret).replace(/\D/g, '').length;
}

/** Posición en `text` justo después del dígito número `count`. */
function caretAfterDigits(text: string, count: number): number {
  if (count === 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (/\d/.test(text.charAt(i))) seen += 1;
    if (seen === count) return i + 1;
  }
  return text.length;
}

/**
 * Amount Input (Cap. 3.14). Monto con la moneda como prefijo y separador de miles
 * mientras se escribe ("1.250.000"). Vacío en 0, para no dejar un cero fijo.
 */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label, value, onChange, currency = 'COP', error, disabled, id }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const pendingCaret = React.useRef<number | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const display = formatAmountInput(value);

    React.useLayoutEffect(() => {
      const input = inputRef.current;
      if (input && pendingCaret.current !== null && document.activeElement === input) {
        const pos = caretAfterDigits(display, pendingCaret.current);
        input.setSelectionRange(pos, pos);
      }
      pendingCaret.current = null;
    }, [display]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: text, selectionStart } = e.target;
      const digitsToCaret = digitsBefore(text, selectionStart ?? text.length);
      const leadingZeros = text.replace(/\D/g, '').match(/^0+/)?.[0].length ?? 0;
      pendingCaret.current = Math.max(0, digitsToCaret - leadingZeros);
      onChange(parseAmountInput(text));
    };

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
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            disabled={disabled}
            value={display}
            onChange={handleChange}
            aria-invalid={!!error}
            className="w-full bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
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
