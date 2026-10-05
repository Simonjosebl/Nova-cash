import { useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import { getRedirectUrl } from '../utils/redirect';

/** Inicia el flujo OAuth con Google (R-03). Al volver, AuthProvider recoge la sesión. */
export function useGoogleLogin() {
  return useMutation({
    mutationFn: () => authService.loginWithGoogle(getRedirectUrl(ROUTES.home)),
  });
}
