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
  it('acepta editor y lector', () => {
    expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'editor' }).success).toBe(true);
    expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'viewer' }).success).toBe(true);
  });
  it('no permite invitar como administrador', () => {
    expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'admin' }).success).toBe(false);
  });
  it('rechaza correo inválido', () => {
    expect(inviteMemberSchema.safeParse({ email: 'x', role: 'editor' }).success).toBe(false);
  });
});
