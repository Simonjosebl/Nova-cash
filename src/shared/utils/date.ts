/** Etiqueta humana de fecha (Cap. 3 / 6.15): Hoy, Ayer o fecha formateada. */
export function formatDateLabel(isoDate: string, now: Date = new Date()): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha de hoy en formato YYYY-MM-DD (local). */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Suma meses a una fecha ISO (YYYY-MM-DD), normalizando el desbordamiento de día. */
export function addMonthsIso(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const base = new Date(y!, m! - 1 + months, d!);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

/** Días entre una fecha ISO y hoy (positivo si es futura). */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Rango [inicio, fin] del mes actual en formato ISO. */
export function currentMonthRange(now: Date = new Date()): { start: string; end: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  return {
    start: `${y}-${pad(m + 1)}-01`,
    end: `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`,
  };
}
