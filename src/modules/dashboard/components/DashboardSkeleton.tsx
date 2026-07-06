import { Skeleton } from '@/shared/ui/skeleton';

/** Skeleton del Dashboard (Cap. 3.25 — nunca pantalla vacía durante la carga). */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <div>
        <Skeleton className="mb-2 h-4 w-28" />
        <Skeleton className="h-12 w-56" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );
}
