const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export interface MonthCell {
  date: string | null;
  day: number | null;
}

export interface MonthView {
  year: number;
  month: number; // 0-11
  label: string;
  start: string;
  end: string;
  cells: MonthCell[];
}

/** Construye la vista mensual (semana inicia lunes, Cap. 4.21 first_day_of_week=1). */
export function buildMonth(year: number, month: number): MonthView {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: MonthCell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: ymd(year, month, d), day: d });

  return {
    year,
    month,
    label: first.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    start: ymd(year, month, 1),
    end: ymd(year, month, daysInMonth),
    cells,
  };
}

/** Avanza/retrocede meses desde un {year, month}. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
