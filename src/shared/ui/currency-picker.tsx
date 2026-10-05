import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTED_CURRENCIES } from '@/shared/constants/currencies';
import {
  getAllCurrencies,
  getCurrencyInfo,
  searchCurrencies,
  type ICurrencyInfo,
} from '@/shared/utils/currency';
import { BottomSheet } from './bottom-sheet';
import { CurrencyFlag } from './currency-flag';
import { Label } from './label';

interface CurrencyPickerProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  id?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

function CurrencyOption({
  currency,
  selected,
  onSelect,
}: {
  currency: ICurrencyInfo;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(currency.code)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
          selected ? 'bg-accent/10' : 'hover:bg-secondary',
        )}
      >
        <CurrencyFlag country={currency.flag} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-medium text-foreground">{currency.name}</span>
          <span className="text-small text-muted-foreground">
            {currency.code} · {currency.symbol}
          </span>
        </span>
        {selected ? <Check className="size-5 shrink-0 text-accent" /> : null}
      </button>
    </li>
  );
}

/**
 * Selector de moneda (R-08): todas las monedas vigentes del mundo con su bandera,
 * buscador por código o nombre y sugeridas al inicio.
 */
export function CurrencyPicker({
  label,
  value,
  onChange,
  id,
  disabled,
  error,
  hint,
}: CurrencyPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = getCurrencyInfo(value);

  const all = getAllCurrencies();
  const results = useMemo(() => searchCurrencies(all, query), [all, query]);
  const suggested = useMemo(() => SUGGESTED_CURRENCIES.map(getCurrencyInfo), []);

  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const select = (code: string) => {
    onChange(code);
    close();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        className={cn(
          'flex h-[52px] w-full items-center gap-3 rounded-md border border-input bg-card px-4 text-left transition-colors',
          'hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
        )}
      >
        <CurrencyFlag country={selected.flag} className="size-6" />
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="text-body font-semibold text-foreground">{selected.code}</span>
          <span className="truncate text-caption text-muted-foreground">{selected.name}</span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
      </button>
      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-muted-foreground">{hint}</p>
      ) : null}

      <BottomSheet open={open} onClose={close} title="Elige una moneda">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por país, nombre o código"
              aria-label="Buscar moneda"
              className="h-12 w-full rounded-md border border-input bg-card pl-12 pr-4 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {query ? null : (
            <section className="flex flex-col gap-1">
              <h3 className="px-3 text-small font-semibold uppercase tracking-wide text-muted-foreground">
                Sugeridas
              </h3>
              <ul role="listbox" aria-label="Monedas sugeridas">
                {suggested.map((c) => (
                  <CurrencyOption
                    key={c.code}
                    currency={c}
                    selected={c.code === value}
                    onSelect={select}
                  />
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-1">
            <h3 className="px-3 text-small font-semibold uppercase tracking-wide text-muted-foreground">
              {query ? `${results.length} resultados` : 'Todas las monedas'}
            </h3>
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-caption text-muted-foreground">
                No encontramos monedas con “{query}”.
              </p>
            ) : (
              <ul role="listbox" aria-label="Todas las monedas">
                {results.map((c) => (
                  <CurrencyOption
                    key={c.code}
                    currency={c}
                    selected={c.code === value}
                    onSelect={select}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </BottomSheet>
    </div>
  );
}
