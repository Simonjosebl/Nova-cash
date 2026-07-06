// Nova Cash · Edge Function · accept-invitation (Cap. 5.15 / 9.9 / 9.14)
// Valida el token de invitación (JWT del invitado, pendiente, no expirada, correo coincide)
// y agrega al usuario como miembro del Workspace usando el service role.
// Deno runtime (Supabase Edge Functions).
//
// Deploy:  supabase functions deploy accept-invitation
// Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (Cap. 9.18)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';

  if (!authHeader) return json({ error: 'UNAUTHENTICATED' }, 401);

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return json({ error: 'INVALID_BODY' }, 400);
  }
  if (!token) return json({ error: 'MISSING_TOKEN' }, 400);

  // Cliente con el JWT del invitado para identificarlo.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'UNAUTHENTICATED' }, 401);
  const user = userData.user;

  // Cliente service-role para operar saltando RLS (validando todo manualmente).
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: invitation } = await admin
    .from('workspace_invitations')
    .select('id, workspace_id, email, role, status, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!invitation || invitation.status !== 'pending') {
    return json({ error: 'INVITATION_INVALID' }, 404);
  }
  if (new Date(invitation.expires_at) < new Date()) {
    await admin.from('workspace_invitations').update({ status: 'expired' }).eq('id', invitation.id);
    return json({ error: 'INVITATION_EXPIRED' }, 410);
  }
  if ((user.email ?? '').toLowerCase() !== invitation.email.toLowerCase()) {
    return json({ error: 'EMAIL_MISMATCH' }, 403);
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (!profile) return json({ error: 'PROFILE_NOT_FOUND' }, 404);

  // Alta idempotente del miembro.
  const { error: memberError } = await admin.from('workspace_members').upsert(
    {
      workspace_id: invitation.workspace_id,
      profile_id: profile.id,
      role: invitation.role,
      status: 'active',
    },
    { onConflict: 'workspace_id,profile_id' },
  );
  if (memberError) return json({ error: 'JOIN_FAILED' }, 500);

  await admin
    .from('workspace_invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return json({ workspaceId: invitation.workspace_id });
});
