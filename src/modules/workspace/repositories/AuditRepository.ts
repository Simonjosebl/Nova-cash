import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import { buildAuditDescription } from '../utils/audit';
import type { AuditEntry } from '../types/audit.types';

interface Ref {
  name: string;
}
interface AuditRow {
  id: string;
  action: string;
  entity: string;
  created_at: string;
  user: Ref | Ref[] | null;
}

export interface IAuditRepository {
  list(workspaceId: string): Promise<AuditEntry[]>;
}

/** Lectura de la bitácora de auditoría (Cap. 5.11). RLS: solo administradores. */
export class AuditRepository implements IAuditRepository {
  async list(workspaceId: string): Promise<AuditEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id,action,entity,created_at, user:profiles!user_id(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw toAppError(error, 'No pudimos cargar el historial.');

    return ((data ?? []) as unknown as AuditRow[]).map((row) => {
      const user = Array.isArray(row.user) ? row.user[0] : row.user;
      return {
        id: row.id,
        action: row.action,
        entity: row.entity,
        userName: user?.name ?? 'Alguien',
        createdAt: row.created_at,
        description: buildAuditDescription(row.action, row.entity),
      };
    });
  }
}

export const auditRepository = new AuditRepository();
