import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '../schemas/auth.schema';

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
  const base = { name: 'Ana', email: 'a@b.com', password: 'clave2026segura', acceptPolicies: true };

  it('acepta registro válido', () => {
    expect(registerSchema.safeParse({ ...base, confirmPassword: 'clave2026segura' }).success).toBe(
      true,
    );
  });
  it('exige aceptar la política de datos', () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: 'clave2026segura',
      acceptPolicies: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('acceptPolicies'))).toBe(true);
    }
  });
  it('rechaza contraseña corta', () => {
    expect(
      registerSchema.safeParse({ ...base, password: '123', confirmPassword: '123' }).success,
    ).toBe(false);
  });
  it('exige 10+ caracteres con letras y números (R-18)', () => {
    const check = (password: string) =>
      registerSchema.safeParse({ ...base, password, confirmPassword: password }).success;
    expect(check('abc12345')).toBe(false);
    expect(check('soloLetrasAqui')).toBe(false);
    expect(check('1234567890')).toBe(false);
    expect(check('clave2026segura')).toBe(true);
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
      registerSchema.safeParse({ ...base, name: 'A', confirmPassword: 'clave2026segura' }).success,
    ).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('exige coincidencia', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'clave2026segura', confirmPassword: 'nope' })
        .success,
    ).toBe(false);
  });
});
