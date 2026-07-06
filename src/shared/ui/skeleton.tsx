import { cn } from '@/lib/utils';

/** Skeleton de carga (Cap. 3.25 — nunca spinner infinito ni pantalla vacía). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
