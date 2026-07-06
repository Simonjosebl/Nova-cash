import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/AuthService';
import type { RegisterInput } from '../schemas/auth.schema';

/** Registra un usuario. Si requiere confirmación de correo, no navega (la página lo informa). */
export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) =>
      authService.register({ name, email, password }),
    onSuccess: (result) => {
      if (!result.needsConfirmation) navigate(ROUTES.home, { replace: true });
    },
  });
}
