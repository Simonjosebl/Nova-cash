import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';

/** Cierra sesión: limpia caché remota y redirige al login (Cap. 9.10). */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    },
  });
}
