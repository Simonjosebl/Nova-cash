import { ROUTES } from '@/shared/constants/routes';

/** Enlace público para aceptar una invitación (R-11). */
export function invitationLink(token: string, origin: string = window.location.origin): string {
  return `${origin}${ROUTES.invite}/${token}`;
}

/** Mensaje listo para compartir por WhatsApp u otra app. */
export function invitationShareText(workspaceName: string, link: string): string {
  return `Te invito a colaborar en "${workspaceName}" en Nova Cash. Ingresa o crea tu cuenta con este correo y acepta aquí: ${link}`;
}
