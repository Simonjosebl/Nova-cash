import { z } from 'zod';

/**
 * Variables de entorno públicas, tipadas y validadas (Cap. 9.18 / 11.4).
 * Solo VITE_* llega al cliente. Nunca leer secretos aquí.
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Nova Cash'),
  VITE_APP_VERSION: z.string().default('0.1.0'),
  VITE_SUPABASE_URL: z.string().url().or(z.literal('')).default(''),
  VITE_SUPABASE_ANON_KEY: z.string().default(''),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // No exponer detalles sensibles; solo advertir en desarrollo (Cap. 9.17).
  console.error('Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida.');
}

export const env = parsed.data;

export const isSupabaseConfigured =
  env.VITE_SUPABASE_URL !== '' && env.VITE_SUPABASE_ANON_KEY !== '';
