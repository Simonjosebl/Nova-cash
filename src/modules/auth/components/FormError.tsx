import { AlertCircle } from 'lucide-react';

/** Banner de error humano (Cap. 3 / 9.17). Nunca muestra detalles técnicos. */
export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-sm bg-destructive/10 p-3 text-caption text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
