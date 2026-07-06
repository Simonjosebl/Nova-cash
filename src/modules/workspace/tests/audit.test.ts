import { describe, it, expect } from 'vitest';
import { buildAuditDescription } from '../utils/audit';

describe('buildAuditDescription', () => {
  it('describe acciones sobre entidades conocidas', () => {
    expect(buildAuditDescription('INSERT', 'transaction')).toBe('registró un movimiento');
    expect(buildAuditDescription('UPDATE', 'transaction')).toBe('editó un movimiento');
    expect(buildAuditDescription('DELETE', 'account')).toBe('eliminó una cuenta');
  });

  it('cae en un valor razonable para entidades desconocidas', () => {
    expect(buildAuditDescription('INSERT', 'gizmo')).toBe('registró gizmo');
  });
});
