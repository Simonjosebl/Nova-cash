import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '../services/ReminderService';
import type { SaveReminderDTO } from '../types/reminder.types';

export const remindersKey = (workspaceId: string) => ['reminders', workspaceId] as const;

export function useReminders(workspaceId: string) {
  return useQuery({
    queryKey: remindersKey(workspaceId),
    queryFn: () => reminderService.list(workspaceId),
    enabled: !!workspaceId,
  });
}

/** Crear/editar, activar/desactivar y eliminar recordatorios del espacio (R-13). */
export function useReminderMutations(workspaceId: string) {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: remindersKey(workspaceId) });

  const save = useMutation({
    mutationFn: ({ id, dto }: { id?: string; dto: SaveReminderDTO }) =>
      id ? reminderService.update(id, dto) : reminderService.create(workspaceId, dto),
    onSuccess,
  });
  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      reminderService.setEnabled(id, enabled),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => reminderService.remove(id),
    onSuccess,
  });

  return { save, toggle, remove };
}
