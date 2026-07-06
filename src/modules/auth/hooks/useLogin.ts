import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import type { LoginInput } from '../schemas/auth.schema';

/** Inicia sesión con email + contraseña. El store se sincroniza vía AuthProvider. */
export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: () => navigate(ROUTES.home, { replace: true }),
  });
}
