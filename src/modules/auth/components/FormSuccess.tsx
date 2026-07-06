import { CheckCircle2 } from 'lucide-react';

/** Confirmación positiva (Cap. 3 — tono humano). */
export function FormSuccess({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-sm bg-success/10 p-3 text-caption text-success">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
