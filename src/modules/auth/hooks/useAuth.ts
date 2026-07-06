import { useAuthStore } from '../store/auth.store';

/** Acceso al estado de sesión para la UI (Cap. 2.5 — la UI solo lee). */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);

  return {
    status,
    user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
