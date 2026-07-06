import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  magicLinkSchema,
} from '../schemas/auth.schema';

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });
  it('rechaza correo inválido', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
  it('rechaza contraseña vacía', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = { name: 'Ana', email: 'a@b.com', password: '12345678' };

  it('acepta registro válido', () => {
    expect(registerSchema.safeParse({ ...base, confirmPassword: '12345678' }).success).toBe(true);
  });
  it('rechaza contraseña corta', () => {
    expect(
      registerSchema.safeParse({ ...base, password: '123', confirmPassword: '123' }).success,
    ).toBe(false);
  });
  it('rechaza contraseñas que no coinciden', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'otra-clave' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });
  it('rechaza nombre demasiado corto', () => {
    expect(
      registerSchema.safeParse({ ...base, name: 'A', confirmPassword: '12345678' }).success,
    ).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('exige coincidencia', () => {
    expect(
      resetPasswordSchema.safeParse({ password: '12345678', confirmPassword: 'nope' }).success,
    ).toBe(false);
  });
});

describe('magicLinkSchema', () => {
  it('valida el correo', () => {
    expect(magicLinkSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(magicLinkSchema.safeParse({ email: 'x' }).success).toBe(false);
  });
});
