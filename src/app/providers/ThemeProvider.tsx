import { useEffect, type ReactNode } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

/** Color de la barra del navegador / status bar por tema (tokens --background). */
const THEME_COLOR = { light: '#F8FAFC', dark: '#030C1E' } as const;

/** Sincroniza el tema con la clase `.dark` de <html> y el meta theme-color (Cap. 3.24). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  return <>{children}</>;
}
