import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/ReportService';
import type { ReportPeriod } from '../types/report.types';

export const reportKey = (workspaceId: string, period: ReportPeriod) =>
  ['report', workspaceId, period] as const;

export function useReport(workspaceId: string, period: ReportPeriod) {
  return useQuery({
    queryKey: reportKey(workspaceId, period),
    queryFn: () => reportService.load(workspaceId, period),
    enabled: !!workspaceId,
  });
}
