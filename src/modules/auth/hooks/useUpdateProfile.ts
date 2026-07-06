import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import type { UpdateProfileInput } from '../schemas/auth.schema';

/** Actualiza el nombre del perfil. El store se sincroniza vía AuthProvider (USER_UPDATED). */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ name }: UpdateProfileInput) => authService.updateProfileName(name),
  });
}
