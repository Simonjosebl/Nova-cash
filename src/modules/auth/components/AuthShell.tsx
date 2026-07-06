import { type ReactNode } from 'react';
import logo from '@/shared/assets/logo.png';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Layout común de las pantallas de autenticación (Cap. 3 / 6.4). */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-10">
      <header className="flex flex-col items-center gap-4">
        <img src={logo} alt="Nova Cash" className="size-16 rounded-md shadow-card" />
        <div className="text-center">
          <h1 className="text-h2 font-bold text-primary">{title}</h1>
          {subtitle ? <p className="text-body text-muted-foreground">{subtitle}</p> : null}
        </div>
      </header>

      <div className="flex flex-col gap-5">{children}</div>

      {footer ? (
        <div className="text-center text-caption text-muted-foreground">{footer}</div>
      ) : null}
    </main>
  );
}
