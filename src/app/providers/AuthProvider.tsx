import { type ReactNode, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/AuthService';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { useWorkspaceStore } from '@/modules/workspace/store/workspace.store';

/**
 * Bootstrap de sesión (Cap. 9.10). Al montar: recupera la sesión persistida por
 * Supabase y se suscribe a los cambios (login/logout/refresh) para mantener el store.
 * Si la sesión termina o cambia de usuario (otra pestaña, token vencido), limpia la caché y
 * el espacio activo para que nunca se vean datos de otra cuenta (R-18).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    authService
      .getCurrentSession()
      .then((auth) => {
        if (!active) return;
        currentUserId.current = auth?.user.id ?? null;
        setAuth(auth?.session ?? null, auth?.user ?? null);
      })
      .catch(() => {
        if (active) setAuth(null, null);
      });

    const unsubscribe = authService.subscribeToAuthChanges((auth) => {
      const nextUserId = auth?.user.id ?? null;
      if (currentUserId.current !== null && currentUserId.current !== nextUserId) {
        queryClient.clear();
        useWorkspaceStore.getState().clear();
      }
      currentUserId.current = nextUserId;
      setAuth(auth?.session ?? null, auth?.user ?? null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setAuth, queryClient]);

  return <>{children}</>;
}
