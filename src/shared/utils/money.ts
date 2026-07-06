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
