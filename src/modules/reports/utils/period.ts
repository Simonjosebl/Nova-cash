import type { ReportPeriod } from '../types/report.types';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export interface PeriodRange {
  from: string;
  to: string;
  months: Array<{ month: string; label: string }>;
}

/** Rango de fechas y meses incluidos para un periodo de reporte (Cap. 6.14). */
export function periodRange(period: ReportPeriod, now: Date = new Date()): PeriodRange {
  const y = now.getFullYear();
  const m = now.getMonth();

  let startY = y;
  let startM = m;
  if (period === 'last_month') {
    const prev = new Date(y, m - 1, 1);
    startY = prev.getFullYear();
    startM = prev.getMonth();
  } else if (period === 'last_6_months') {
    const back = new Date(y, m - 5, 1);
    startY = back.getFullYear();
    startM = back.getMonth();
  }

  // El fin del rango es el fin del mes de referencia (mes anterior o mes actual).
  const endRef = period === 'last_month' ? new Date(y, m - 1, 1) : new Date(y, m, 1);
  const endY = endRef.getFullYear();
  const endM = endRef.getMonth();

  const months: Array<{ month: string; label: string }> = [];
  const cursor = new Date(startY, startM, 1);
  const last = new Date(endY, endM, 1);
  while (cursor <= last) {
    months.push({
      month: `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`,
      label: MONTHS_ES[cursor.getMonth()]!,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return {
    from: ymd(startY, startM, 1),
    to: ymd(endY, endM, new Date(endY, endM + 1, 0).getDate()),
    months,
  };
}
