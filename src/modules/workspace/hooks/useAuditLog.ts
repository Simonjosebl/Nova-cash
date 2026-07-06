import { useQuery } from '@tanstack/react-query';
import { auditRepository } from '../repositories/AuditRepository';

export const auditKey = (workspaceId: string) => ['audit', workspaceId] as const;

/** Historial colaborativo (Cap. 4.18). Solo administradores (RLS). */
export function useAuditLog(workspaceId: string) {
  return useQuery({
    queryKey: auditKey(workspaceId),
    queryFn: () => auditRepository.list(workspaceId),
    enabled: !!workspaceId,
  });
}
