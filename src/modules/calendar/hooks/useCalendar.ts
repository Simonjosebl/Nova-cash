import { useQuery } from '@tanstack/react-query';
import { calendarService } from '../services/CalendarService';

export const calendarKey = (workspaceId: string, monthStart: string) =>
  ['calendar', workspaceId, monthStart] as const;

/** Eventos del mes visible (Cap. 6.11). */
export function useCalendarEvents(workspaceId: string, monthStart: string, monthEnd: string) {
  return useQuery({
    queryKey: calendarKey(workspaceId, monthStart),
    queryFn: () => calendarService.listRange(workspaceId, monthStart, monthEnd),
    enabled: !!workspaceId,
  });
}
