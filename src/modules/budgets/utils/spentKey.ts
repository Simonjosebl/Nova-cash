/** Clave del gasto agregado por categoría y moneda (R-08). */
export function spentKey(categoryId: string, currency: string): string {
  return `${categoryId}:${currency}`;
}
