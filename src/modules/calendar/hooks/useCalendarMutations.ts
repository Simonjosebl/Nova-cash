import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsKey } from '@/modules/accounts/hooks/useAccounts';
import { dashboardKey } from '@/modules/dashboard/hooks/useDashboard';
import { calendarService } from '../services/CalendarService';
import type { CalendarEvent, CreateEventDTO, UpdateEventDTO } from '../types/calendar.types';

function useCalendarInvalidate(workspaceId: string, cascade = false) {
  const queryClient = useQueryClient();
  return () => {
    const jobs = [queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] })];
    if (cascade) {
      jobs.push(
        queryClient.invalidateQueries({ queryKey: accountsKey(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] }),
      );
    } else {
      // Un evento nuevo/editado afecta "próximos pagos" del Dashboard.
      jobs.push(queryClient.invalidateQueries({ queryKey: dashboardKey(workspaceId) }));
    }
    return Promise.all(jobs);
  };
}

export function useCreateEvent(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId);
  return useMutation({
    mutationFn: (dto: CreateEventDTO) => calendarService.create(workspaceId, dto),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEventDTO }) =>
      calendarService.update(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => calendarService.remove(id),
    onSuccess: invalidate,
  });
}

export function useCancelEvent(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => calendarService.cancel(id),
    onSuccess: invalidate,
  });
}

export function usePostponeEvent(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => calendarService.postpone(id, date),
    onSuccess: invalidate,
  });
}

/** Registrar pago: crea la transacción y marca el evento (cascada completa). */
export function useRegisterPayment(workspaceId: string) {
  const invalidate = useCalendarInvalidate(workspaceId, true);
  return useMutation({
    mutationFn: ({ event, accountId }: { event: CalendarEvent; accountId: string }) =>
      calendarService.registerPayment(event, accountId),
    onSuccess: invalidate,
  });
}
