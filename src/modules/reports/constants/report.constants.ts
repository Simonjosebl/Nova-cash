import type { ReportPeriod } from '../types/report.types';

export const PERIOD_OPTIONS: ReadonlyArray<{ value: ReportPeriod; label: string }> = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'last_6_months', label: '6 meses' },
];

/** Paleta para las porciones del donut (uso estratégico del color, Cap. 3.19). */
export const SLICE_PALETTE = [
  '#2563EB', // Nova Blue
  '#06B6D4', // Nova Cyan
  '#22C55E', // Nova Green
  '#F59E0B', // Nova Orange
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
];

export const SLICE_OTHER_COLOR = '#94A3B8';
