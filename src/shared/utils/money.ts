import { MAX_AMOUNT_DIGITS } from '@/shared/constants/limits';

/**
 * Formato de dinero (Cap. 3 — claridad). Sin decimales para monedas de alto nominal (LatAm).
 * No hardcodea locale por moneda; usa es-CO como base regional.
 */
export function formatMoney(amount: number, currency = 'COP'): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Moneda no reconocida por Intl: fallback legible.
    return `${Math.round(amount).toLocaleString('es-CO')} ${currency}`;
  }
}

/** Porcentaje entero seguro (evita división por cero). */
export function toPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

/** Texto de un campo de monto: "1.250.000" con separador es-CO; vacío cuando es 0. */
export function formatAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  return Math.trunc(value).toLocaleString('es-CO');
}

/** Lee lo escrito en un campo de monto ignorando puntos, espacios y símbolos. */
export function parseAmountInput(text: string): number {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_AMOUNT_DIGITS);
  return digits === '' ? 0 : Number(digits);
}
