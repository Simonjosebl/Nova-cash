import { AppError } from './app-error';

interface DbErrorLike {
  message?: string;
  code?: string;
}

/**
 * Normaliza errores de Supabase/PostgREST a AppError con mensaje humano (Cap. 9.17).
 * Nunca expone el detalle técnico al usuario; lo conserva en `details` para logs.
 */
export function toAppError(
  error: DbErrorLike | null,
  fallback = 'No pudimos completar la operación. Intenta nuevamente.',
): AppError {
  if (error?.code === '23505') {
    return new AppError('DUPLICATE', 'Ese registro ya existe.', { details: error });
  }
  if (error?.code === '42501' || error?.code === 'PGRST301') {
    return new AppError('PERMISSION_DENIED', 'No tienes permiso para esta acción.', {
      details: error,
    });
  }
  return new AppError('DB_ERROR', fallback, { details: error });
}
