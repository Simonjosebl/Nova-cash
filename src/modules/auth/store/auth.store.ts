import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AuthStatus, AuthUser } from '../types/auth.types';

/**
 * Estado global de sesión (Cap. 2.12 — Zustand para usuario/sesión).
 * La persistencia la maneja Supabase (localStorage); este store es el espejo reactivo.
 * Fuente de verdad: AuthProvider (onAuthStateChange).
 */
interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: AuthUser | null;
  setAuth: (session: Session | null, user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  setAuth: (session, user) =>
    set({
      session,
      user,
      status: session ? 'authenticated' : 'unauthenticated',
    }),
  clear: () => set({ session: null, user: null, status: 'unauthenticated' }),
}));
