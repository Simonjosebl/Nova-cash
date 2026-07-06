import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Insight, InsightPriority } from '../types/insight.types';

const PRIORITY_STYLES: Record<InsightPriority, string> = {
  critical: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  motivational: 'bg-accent/10 text-accent',
  informative: 'bg-secondary text-muted-foreground',
};

/** Nova Insight (Cap. 3.16 / 6.7): siempre primero, tono humano, no más de dos líneas. */
export function InsightCard({ insight, primary }: { insight: Insight; primary?: boolean }) {
  return (
    <div className={cn('rounded-lg p-4', PRIORITY_STYLES[insight.priority])}>
      {primary ? (
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="size-4" />
          <span className="text-small font-semibold uppercase tracking-wide">Nova Insight</span>
        </div>
      ) : null}
      <p className="text-body font-medium leading-snug">
        <span className="mr-1">{insight.emoji}</span>
        {insight.message}
      </p>
    </div>
  );
}
