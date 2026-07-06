import { cn } from '@/lib/utils';

/** Barra de progreso (Cap. 6.12). El color lo define quien la usa según el estado. */
export function ProgressBar({ percent, barClass }: { percent: number; barClass?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn('h-full rounded-full transition-all', barClass ?? 'bg-primary')}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
