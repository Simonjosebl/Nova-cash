/** Construye URLs de redirección absolutas para los correos de Supabase (magic link / reset). */
export function getRedirectUrl(path: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${path}`;
}
