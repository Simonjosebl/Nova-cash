import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import type { ResetPasswordInput } from '../schemas/auth.schema';

/** Define una nueva contraseña (tras abrir el enlace de recuperación). */
export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ password }: ResetPasswordInput) => authService.resetPassword(password),
    onSuccess: () => navigate(ROUTES.home, { replace: true }),
  });
}
