// Nova Cash · Plantilla del correo de invitación (R-11).
// HTML con estilos en línea (compatibilidad con clientes de correo) y versión en texto plano.

export interface InvitationEmailData {
  inviterName: string;
  workspaceName: string;
  workspaceEmoji: string;
  acceptUrl: string;
  expiresAt: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Quita saltos de línea (evita inyección de cabeceras en el asunto) y acota el largo. */
const oneLine = (value: string, max = 60): string =>
  value
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, max);

export function invitationSubject(data: InvitationEmailData): string {
  return `${oneLine(data.inviterName)} te invitó a "${oneLine(data.workspaceName)}" en Nova Cash`;
}

export function invitationText(data: InvitationEmailData): string {
  return [
    `${data.inviterName} te invitó a colaborar en "${data.workspaceName}" en Nova Cash.`,
    '',
    'Entrarás como Editor: podrás ver y registrar movimientos del espacio.',
    `Acepta la invitación aquí: ${data.acceptUrl}`,
    '',
    `Ingresa o crea tu cuenta con este mismo correo. El enlace vence el ${formatDate(data.expiresAt)}.`,
    'Si no esperabas esta invitación, puedes ignorar este correo.',
  ].join('\n');
}

export function invitationHtml(data: InvitationEmailData): string {
  const inviter = escapeHtml(data.inviterName);
  const workspace = escapeHtml(data.workspaceName);
  const emoji = escapeHtml(data.workspaceEmoji);
  const url = escapeHtml(data.acceptUrl);

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4FF;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px -8px rgba(15,23,42,0.18);">
            <tr>
              <td style="background:linear-gradient(135deg,#0F172A 0%,#2563EB 55%,#06B6D4 100%);background-color:#2563EB;padding:32px 24px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">NovaCash</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;text-align:center;">
                <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:999px;background:#E6F0FF;font-size:32px;">${emoji}</div>
                <h1 style="margin:20px 0 8px;font-size:22px;line-height:30px;color:#0F172A;">Te invitaron a colaborar</h1>
                <p style="margin:0;font-size:16px;line-height:24px;color:#475569;">
                  <strong style="color:#0F172A;">${inviter}</strong> te invitó al espacio
                  <strong style="color:#0F172A;">${workspace}</strong>. Entrarás como
                  <strong style="color:#0F172A;">Editor</strong>: podrás ver y registrar movimientos.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;text-align:center;">
                <a href="${url}" style="display:inline-block;background:#0F172A;color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:600;padding:16px 32px;border-radius:16px;">Aceptar invitación</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;text-align:center;">
                <p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#64748B;">
                  Ingresa o crea tu cuenta con este mismo correo. El enlace vence el ${escapeHtml(formatDate(data.expiresAt))}.
                </p>
                <p style="margin:0;font-size:12px;line-height:18px;color:#94A3B8;word-break:break-all;">
                  Si el botón no funciona, copia este enlace: ${url}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#F8FAFC;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94A3B8;">Si no esperabas esta invitación, ignora este correo.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
