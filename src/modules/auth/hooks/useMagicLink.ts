import { useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import { getRedirectUrl } from '../utils/redirect';
import type { MagicLinkInput } from '../schemas/auth.schema';

/** Envía un enlace mágico de acceso al correo. */
export function useMagicLink() {
  return useMutation({
    mutationFn: ({ email }: MagicLinkInput) =>
      authService.sendMagicLink(email, getRedirectUrl(ROUTES.home)),
  });
}
