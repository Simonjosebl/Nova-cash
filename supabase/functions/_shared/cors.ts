// Nova Cash · CORS de Edge Functions (R-18). Solo orígenes propios: la app (APP_URL),
// desarrollo local y la app nativa (Capacitor). Nunca '*'.

const NATIVE_ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost'];
const DEV_ORIGINS = ['http://localhost:5173'];

function allowedOrigins(): string[] {
  const appUrl = (Deno.env.get('APP_URL') ?? '').replace(/\/+$/, '');
  return [appUrl, ...DEV_ORIGINS, ...NATIVE_ORIGINS].filter(Boolean);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = allowedOrigins();
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] ?? ''),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
