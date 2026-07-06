import { describe, it, expect } from 'vitest';
import { AUTH_ERROR, mapAuthError } from '../constants/auth.errors';

describe('mapAuthError', () => {
  it('mapea credenciales inválidas', () => {
    expect(mapAuthError({ message: 'Invalid login credentials' }).code).toBe(
      AUTH_ERROR.INVALID_CREDENTIALS,
    );
  });

  it('mapea correo ya registrado', () => {
    expect(mapAuthError({ message: 'User already registered' }).code).toBe(AUTH_ERROR.EMAIL_IN_USE);
  });

  it('mapea correo no confirmado', () => {
    expect(mapAuthError({ message: 'Email not confirmed' }).code).toBe(
      AUTH_ERROR.EMAIL_NOT_CONFIRMED,
    );
  });

  it('mapea rate limit por status 429', () => {
    expect(mapAuthError({ message: 'x', status: 429 }).code).toBe(AUTH_ERROR.RATE_LIMITED);
  });

  it('usa fallback seguro para errores desconocidos', () => {
    const result = mapAuthError({ message: 'boom internal db error' });
    expect(result.code).toBe(AUTH_ERROR.UNKNOWN);
    expect(result.message).not.toContain('db');
  });

  it('tolera error nulo', () => {
    expect(mapAuthError(null).code).toBe(AUTH_ERROR.UNKNOWN);
  });
});
