export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  userName: string;
  createdAt: string;
  description: string;
}
