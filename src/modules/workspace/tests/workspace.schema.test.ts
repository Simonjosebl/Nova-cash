import { describe, it, expect } from 'vitest';
import { createWorkspaceSchema, inviteMemberSchema } from '../schemas/workspace.schema';

describe('createWorkspaceSchema', () => {
  const base = { name: 'Hogar', emoji: '🏠', type: 'family' as const, currency: 'COP' };

  it('acepta datos válidos', () => {
    expect(createWorkspaceSchema.safeParse(base).success).toBe(true);
  });
  it('rechaza nombre corto', () => {
    expect(createWorkspaceSchema.safeParse({ ...base, name: 'A' }).success).toBe(false);
  });
  it('rechaza tipo inválido', () => {
    expect(createWorkspaceSchema.safeParse({ ...base, type: 'empresa' }).success).toBe(false);
  });
});

describe('inviteMemberSchema', () => {
  it('solo pide un correo válido (el rol es siempre editor)', () => {
    expect(inviteMemberSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(inviteMemberSchema.safeParse({ email: 'no-es-correo' }).success).toBe(false);
  });
});
