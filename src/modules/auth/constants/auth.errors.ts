/** Códigos de error de auth (Cap. 8) y su mensaje humano (Cap. 9.17). */
export const AUTH_ERROR = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  RATE_LIMITED: 'RATE_LIMITED',
  NO_SESSION: 'NO_SESSION',
  UNKNOWN: 'AUTH_UNKNOWN',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

/**
 * Traduce un error de Supabase Auth a { code, message } tipado y humano.
 * Nunca expone detalles internos al usuario.
 */
export function mapAuthError(input: { message?: string; status?: number } | null): {
  code: AuthErrorCode;
  message: string;
} {
  const raw = (input?.message ?? '').toLowerCase();

  if (raw.includes('invalid login credentials')) {
    return { code: AUTH_ERROR.INVALID_CREDENTIALS, message: 'Correo o contraseña incorrectos.' };
  }
  if (raw.includes('already registered') || raw.includes('already been registered')) {
    return { code: AUTH_ERROR.EMAIL_IN_USE, message: 'Este correo ya está registrado.' };
  }
  if (raw.includes('email not confirmed')) {
    return {
      code: AUTH_ERROR.EMAIL_NOT_CONFIRMED,
      message: 'Debes confirmar tu correo antes de ingresar.',
    };
  }
  if (raw.includes('password') && (raw.includes('weak') || raw.includes('at least'))) {
    return {
      code: AUTH_ERROR.WEAK_PASSWORD,
      message: 'La contraseña es demasiado débil.',
    };
  }
  if (input?.status === 429 || raw.includes('rate limit')) {
    return {
      code: AUTH_ERROR.RATE_LIMITED,
      message: 'Demasiados intentos. Espera un momento e intenta de nuevo.',
    };
  }
  return {
    code: AUTH_ERROR.UNKNOWN,
    message: 'No pudimos completar la operación. Intenta nuevamente.',
  };
}
