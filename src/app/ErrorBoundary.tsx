import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Captura errores de render y muestra una pantalla humana (Cap. 3 — nunca "error" técnico
 * ni pantalla en blanco). En producción, aquí se conectaría el logging (Sentry, Cap. 11.14).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.error('ErrorBoundary', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <span className="text-5xl">🙈</span>
        <h1 className="text-h3 font-bold text-primary">Algo salió mal</h1>
        <p className="text-body text-muted-foreground">
          Tuvimos un problema al mostrar esta pantalla. Intenta recargar.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="h-[52px] rounded-md bg-primary px-6 text-body font-semibold text-primary-foreground active:scale-[0.97]"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
}
