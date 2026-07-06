import { useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import { getRedirectUrl } from '../utils/redirect';
import type { ForgotPasswordInput } from '../schemas/auth.schema';

/** Envía el correo de recuperación de contraseña (redirige a /reset-password). */
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) =>
      authService.sendPasswordReset(email, getRedirectUrl(ROUTES.resetPassword)),
  });
}
