// Nova Cash · Edge Function · accept-invitation (Cap. 5.15 / 9.9 / R-18)
// Envoltorio de la RPC atómica public.accept_invitation(p_token): se ejecuta con el JWT del
// invitado (sin service role). La RPC valida correo confirmado y coincidente, vigencia, espacio
// activo y alta como editor sin degradar a miembros existentes.
// La app llama a la RPC directamente; esta función se mantiene por compatibilidad.
//
// Deploy:  supabase functions deploy accept-invitation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, isUuid, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return jsonResponse(req, { error: 'METHOD_NOT_ALLOWED' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return jsonResponse(req, { error: 'UNAUTHENTICATED' }, 401);

  let token: unknown;
  try {
    ({ token } = await req.json());
  } catch {
    return jsonResponse(req, { error: 'INVALID_BODY' }, 400);
  }
  if (!isUuid(token)) return jsonResponse(req, { error: 'INVITATION_INVALID' }, 400);

  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
  );

  const { data, error } = await client.rpc('accept_invitation', { p_token: token });
  if (error || !data) {
    return jsonResponse(
      req,
      { error: error?.hint || 'INVITATION_INVALID', message: error?.message },
      400,
    );
  }
  return jsonResponse(req, { workspaceId: data });
});
