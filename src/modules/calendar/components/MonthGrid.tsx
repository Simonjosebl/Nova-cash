import { cn } from '@/lib/utils';
import { WEEKDAYS_SHORT } from '../constants/calendar.constants';
import type { MonthView } from '../utils/month';
import type { CalendarEvent } from '../types/calendar.types';

interface MonthGridProps {
  view: MonthView;
  eventsByDate: Map<string, CalendarEvent[]>;
  today: string;
  onSelectDay: (date: string) => void;
}

/** Grilla mensual (Cap. 3.17 / 6.11): cada día muestra emojis, nunca puntos. */
export function MonthGrid({ view, eventsByDate, today, onSelectDay }: MonthGridProps) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-small text-muted-foreground">
        {WEEKDAYS_SHORT.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {view.cells.map((cell, index) => {
          if (!cell.date) return <div key={`empty-${index}`} />;
          const events = eventsByDate.get(cell.date) ?? [];
          const isToday = cell.date === today;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDay(cell.date!)}
              className={cn(
                'flex min-h-[56px] flex-col items-center rounded-sm p-1 text-caption active:bg-secondary',
                isToday ? 'bg-secondary font-bold text-primary' : 'text-foreground',
              )}
            >
              <span>{cell.day}</span>
              <span className="mt-0.5 flex flex-wrap justify-center gap-0.5 text-[11px] leading-none">
                {events.slice(0, 3).map((e) => (
                  <span key={e.id} className={cn(e.status !== 'pending' && 'opacity-40')}>
                    {e.emoji}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
