export type ReportPeriod = 'this_month' | 'last_month' | 'last_6_months';

export interface CategorySlice {
  name: string;
  emoji: string;
  amount: number;
  percent: number;
  color: string;
}

export interface MonthPoint {
  label: string; // 'jul'
  month: string; // '2026-07'
  income: number;
  expense: number;
}

export interface ReportData {
  from: string;
  to: string;
  income: number;
  expense: number;
  balance: number;
  expenseByCategory: CategorySlice[];
  trend: MonthPoint[];
}
