// Nova Cash · Edge Function · send-invitation (Cap. 5.15 / R-11 / R-18)
// Envía (o reenvía) el correo de una invitación pendiente con el enlace para unirse.
// Solo un administrador del espacio puede hacerlo. Proveedor: Resend o SMTP (_shared/sendEmail).
// Anti-abuso: 1 envío por minuto y máximo 5 por invitación (el tope diario por espacio lo
// aplica la base de datos al crear invitaciones).
//
// Deploy:  supabase functions deploy send-invitation
// Secrets: APP_URL ("http://localhost:5173" o "https://tu-dominio.com") y un proveedor:
//          · SMTP_HOST, SMTP_USER, SMTP_PASSWORD (Gmail: smtp.gmail.com + contraseña de app)
//          · o RESEND_API_KEY + EMAIL_FROM ("Nova Cash <hola@tu-dominio.com>")
//          (SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, isUuid, jsonResponse } from '../_shared/cors.ts';
import { invitationHtml, invitationSubject, invitationText } from '../_shared/invitationEmail.ts';
import { isEmailConfigured, sendEmail } from '../_shared/sendEmail.ts';

const MIN_SECONDS_BETWEEN_SENDS = 60;
const MAX_SENDS_PER_INVITATION = 5;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return jsonResponse(req, { error: 'METHOD_NOT_ALLOWED' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const appUrl = (Deno.env.get('APP_URL') ?? '').replace(/\/+$/, '');
  const authHeader = req.headers.get('Authorization') ?? '';

  if (!isEmailConfigured() || !appUrl)
    return jsonResponse(req, { error: 'EMAIL_NOT_CONFIGURED' }, 500);
  if (!authHeader) return jsonResponse(req, { error: 'UNAUTHENTICATED' }, 401);

  let invitationId: unknown;
  try {
    ({ invitationId } = await req.json());
  } catch {
    return jsonResponse(req, { error: 'INVALID_BODY' }, 400);
  }
  if (!isUuid(invitationId)) return jsonResponse(req, { error: 'INVITATION_INVALID' }, 400);

  // Cliente con el JWT de quien invita: identifica al usuario y valida permisos con RLS.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return jsonResponse(req, { error: 'UNAUTHENTICATED' }, 401);

  // Cliente service-role para leer el token (nunca se expone a quien no es admin).
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: invitation } = await admin
    .from('workspace_invitations')
    .select(
      'id, workspace_id, email, token, status, expires_at, invited_by, send_count, last_sent_at',
    )
    .eq('id', invitationId)
    .maybeSingle();
  if (
    !invitation ||
    invitation.status !== 'pending' ||
    new Date(invitation.expires_at) <= new Date()
  ) {
    return jsonResponse(req, { error: 'INVITATION_INVALID' }, 404);
  }

  // is_workspace_admin también exige que el espacio no esté eliminado.
  const { data: isAdmin } = await userClient.rpc('is_workspace_admin', {
    ws: invitation.workspace_id,
  });
  if (isAdmin !== true) return jsonResponse(req, { error: 'FORBIDDEN' }, 403);

  const lastSent = invitation.last_sent_at ? Date.parse(invitation.last_sent_at) : 0;
  if (
    invitation.send_count >= MAX_SENDS_PER_INVITATION ||
    Date.now() - lastSent < MIN_SECONDS_BETWEEN_SENDS * 1000
  ) {
    return jsonResponse(req, { error: 'RATE_LIMITED' }, 429);
  }

  const [{ data: workspace }, { data: inviter }] = await Promise.all([
    admin.from('workspaces').select('name, emoji').eq('id', invitation.workspace_id).single(),
    admin.from('profiles').select('name').eq('id', invitation.invited_by).maybeSingle(),
  ]);

  const emailData = {
    inviterName: inviter?.name || 'Un usuario de Nova Cash',
    workspaceName: workspace?.name ?? 'Nova Cash',
    workspaceEmoji: workspace?.emoji ?? '💰',
    acceptUrl: `${appUrl}/invite/${invitation.token}`,
    expiresAt: invitation.expires_at,
  };

  // Reserva el envío antes de mandar (evita ráfagas en paralelo).
  const { data: reserved } = await admin
    .from('workspace_invitations')
    .update({ send_count: invitation.send_count + 1, last_sent_at: new Date().toISOString() })
    .eq('id', invitation.id)
    .eq('send_count', invitation.send_count)
    .select('id')
    .maybeSingle();
  if (!reserved) return jsonResponse(req, { error: 'RATE_LIMITED' }, 429);

  const result = await sendEmail({
    to: invitation.email,
    subject: invitationSubject(emailData),
    html: invitationHtml(emailData),
    text: invitationText(emailData),
  });
  if (!result.ok) {
    console.error('send-invitation: fallo del proveedor de correo', result.error);
    return jsonResponse(req, { error: 'EMAIL_SEND_FAILED' }, 502);
  }

  return jsonResponse(req, { sent: true });
});
