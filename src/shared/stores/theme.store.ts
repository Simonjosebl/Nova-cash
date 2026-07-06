import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Estado global de tema (Cap. 2.12 — Zustand solo para usuario/workspace/tema/config).
 * Dark Mode queda PREPARADO pero no se activa en el MVP (Cap. 3.24): el default es 'light'.
 */
export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'nova-theme' },
  ),
);
