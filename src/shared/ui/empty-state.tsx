import { type ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Estado vacío (Cap. 3 — ilustración + texto + acción; nunca "No hay datos"). */
export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="text-subtitle font-semibold text-foreground">{title}</p>
      {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
