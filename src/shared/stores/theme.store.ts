import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Estado global de tema (Cap. 2.12 — Zustand solo para usuario/workspace/tema/config).
 * Dark Mode activo (Cap. 3.24 / R-02): sin elección previa se respeta la preferencia del sistema.
 */
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'nova-theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
