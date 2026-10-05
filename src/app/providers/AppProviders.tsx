import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ConfirmProvider } from './ConfirmProvider';

/**
 * Composición única de providers de la app (Cap. 2.5).
 * A futuro: WorkspaceProvider, etc. se anidan aquí.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
