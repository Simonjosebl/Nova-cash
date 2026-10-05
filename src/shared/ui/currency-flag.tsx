import 'flag-icons/css/flag-icons.min.css';
import { cn } from '@/lib/utils';

interface CurrencyFlagProps {
  /** Código de país ISO 3166-1 alfa-2 en minúsculas (ver getCurrencyInfo). */
  country: string;
  className?: string;
}

/**
 * Bandera del país de una moneda (R-08). SVG de `flag-icons`: se ve igual en todos los
 * sistemas (los emojis de bandera no se muestran en Windows).
 */
export function CurrencyFlag({ country, className }: CurrencyFlagProps) {
  return (
    <span
      aria-hidden
      className={cn(
        `fi fi-${country} fis shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_hsl(var(--border))]`,
        'size-7',
        className,
      )}
    />
  );
}
