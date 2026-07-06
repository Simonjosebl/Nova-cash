import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/**
 * Cliente Supabase (única instancia). Solo lo consumen los Repositories (ADR-010).
 * La UI NUNCA importa este archivo directamente.
 *
 * Nota: el tipo `Database` se generará en fases posteriores con la CLI de Supabase
 * (`supabase gen types typescript`) y reemplazará el genérico por defecto.
 */
// Placeholders válidos cuando aún no hay configuración (dev/tests): permiten construir
// el cliente sin lanzar; las llamadas fallarán de forma controlada hasta configurar .env.
const url = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const anonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
