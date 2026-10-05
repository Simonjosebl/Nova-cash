import { useThemeStore, type Theme } from '@/shared/stores/theme.store';

interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Acceso de la UI al tema actual (Cap. 3.24). */
export function useTheme(): UseThemeResult {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}
