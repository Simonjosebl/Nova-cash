/**
 * Ruta a la que volver tras iniciar sesión (p. ej. un enlace de invitación — R-11).
 * Vive en sessionStorage: sobrevive al redirect de Google en la misma pestaña.
 */
const KEY = 'nova-return-path';

export function saveReturnPath(path: string): void {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // Sin almacenamiento disponible: el usuario volverá al inicio.
  }
}

/** Devuelve la ruta guardada (una sola vez) o null. */
export function consumeReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const safe = path?.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
    return safe && path ? path : null;
  } catch {
    return null;
  }
}
