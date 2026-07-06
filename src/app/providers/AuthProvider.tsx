import { type ReactNode, useEffect } from 'react';
import { authService } from '@/modules/auth/services/AuthService';
import { useAuthStore } from '@/modules/auth/store/auth.store';

/**
 * Bootstrap de sesión (Cap. 9.10). Al montar: recupera la sesión persistida por
 * Supabase y se suscribe a los cambios (login/logout/refresh) para mantener el store.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    let active = true;

    authService
      .getCurrentSession()
      .then((auth) => {
        if (active) setAuth(auth?.session ?? null, auth?.user ?? null);
      })
      .catch(() => {
        if (active) setAuth(null, null);
      });

    const unsubscribe = authService.subscribeToAuthChanges((auth) => {
      setAuth(auth?.session ?? null, auth?.user ?? null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setAuth]);

  return <>{children}</>;
}
