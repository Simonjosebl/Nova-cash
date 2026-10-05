import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/ReportService';
import type { ReportPeriod } from '../types/report.types';

export const reportKey = (workspaceId: string, currency: string, period: ReportPeriod) =>
  ['report', workspaceId, currency, period] as const;

export function useReport(workspaceId: string, currency: string, period: ReportPeriod) {
  return useQuery({
    queryKey: reportKey(workspaceId, currency, period),
    queryFn: () => reportService.load(workspaceId, currency, period),
    enabled: !!workspaceId,
  });
}
