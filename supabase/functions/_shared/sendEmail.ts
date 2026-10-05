// Nova Cash · Envío de correos desde Edge Functions (Cap. 5.15 / R-11).
// Proveedor según los secretos configurados:
//   1. Resend (RESEND_API_KEY) — recomendado con dominio propio verificado.
//   2. SMTP (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) — p. ej. Gmail con contraseña de
//      aplicación; sirve sin dominio propio. Puerto 465 (TLS): Supabase bloquea 25 y 587.

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendResult = { ok: true } | { ok: false; error: string };

/** Remitente: EMAIL_FROM o, con SMTP, "Nova Cash <SMTP_USER>". */
function sender(): string {
  const from = Deno.env.get('EMAIL_FROM');
  if (from) return from;
  return `Nova Cash <${Deno.env.get('SMTP_USER') ?? ''}>`;
}

async function sendWithResend(apiKey: string, message: EmailMessage): Promise<SendResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: sender(),
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  return response.ok ? { ok: true } : { ok: false, error: await response.text() };
}

async function sendWithSmtp(message: EmailMessage): Promise<SendResult> {
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get('SMTP_HOST') ?? '',
      port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
      tls: true,
      auth: {
        username: Deno.env.get('SMTP_USER') ?? '',
        password: Deno.env.get('SMTP_PASSWORD') ?? '',
      },
    },
  });
  try {
    await client.send({
      from: sender(),
      to: message.to,
      subject: message.subject,
      content: message.text,
      html: message.html,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await client.close();
  }
}

/** ¿Hay algún proveedor configurado? */
export function isEmailConfigured(): boolean {
  if (Deno.env.get('RESEND_API_KEY')) return true;
  return Boolean(
    Deno.env.get('SMTP_HOST') && Deno.env.get('SMTP_USER') && Deno.env.get('SMTP_PASSWORD'),
  );
}

export function sendEmail(message: EmailMessage): Promise<SendResult> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  return resendKey ? sendWithResend(resendKey, message) : sendWithSmtp(message);
}
