/**
 * Error tipado transversal (Cap. 8). Los Services nunca lanzan Error genérico:
 * siempre AppError con code, message (humano, Cap. 9.17) y detalle opcional.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(code: string, message: string, options?: { status?: number; details?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Mensaje humano para mostrar en la UI, con fallback seguro. */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  return 'No pudimos completar la operación. Intenta nuevamente.';
}
