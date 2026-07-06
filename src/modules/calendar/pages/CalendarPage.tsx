import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatMoney } from '@/shared/utils/money';
import { formatDateLabel, todayIso } from '@/shared/utils/date';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useCalendarEvents } from '../hooks/useCalendar';
import { MonthGrid } from '../components/MonthGrid';
import { EventFormSheet } from '../components/EventFormSheet';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { buildMonth, shiftMonth } from '../utils/month';
import type { CalendarEvent } from '../types/calendar.types';

/** Calendario financiero (Cap. 3.17 / 6.11): vista mensual con emojis por día. */
export function CalendarPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const currency = active?.currency ?? 'COP';
  const canEdit = active?.role === 'admin' || active?.role === 'editor';
  const today = todayIso();

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const view = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);

  const { data: events = [], isLoading } = useCalendarEvents(workspaceId, view.start, view.end);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ date: string; event?: CalendarEvent } | null>(null);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  const dayEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-bold capitalize text-primary">{view.label}</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mes anterior"
            onClick={() => setCursor((c) => shiftMonth(c.year, c.month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mes siguiente"
            onClick={() => setCursor((c) => shiftMonth(c.year, c.month, 1))}
          >
            <ChevronRight />
          </Button>
          {canEdit ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Nuevo evento"
              onClick={() => setFormState({ date: today })}
            >
              <Plus />
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : (
        <MonthGrid
          view={view}
          eventsByDate={eventsByDate}
          today={today}
          onSelectDay={setSelectedDate}
        />
      )}

      {/* Hoja del día seleccionado */}
      <BottomSheet
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatDateLabel(selectedDate) : ''}
      >
        <div className="flex flex-col gap-2">
          {dayEvents.length === 0 ? (
            <p className="text-body text-muted-foreground">Sin eventos este día.</p>
          ) : (
            dayEvents.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  setDetail(e);
                  setSelectedDate(null);
                }}
                className="flex items-center gap-3 rounded-md border border-input bg-card px-4 py-3 text-left active:scale-[0.99]"
              >
                <span className="text-2xl">{e.emoji}</span>
                <span className="flex-1 text-body text-foreground">{e.title}</span>
                <span className="text-body font-semibold text-foreground">
                  {formatMoney(e.amount, currency)}
                </span>
              </button>
            ))
          )}
          {canEdit && selectedDate ? (
            <Button
              variant="secondary"
              onClick={() => {
                setFormState({ date: selectedDate });
                setSelectedDate(null);
              }}
            >
              <Plus />
              Nuevo evento
            </Button>
          ) : null}
        </div>
      </BottomSheet>

      {active && formState ? (
        <EventFormSheet
          key={formState.event?.id ?? `new-${formState.date}`}
          open
          onClose={() => setFormState(null)}
          workspaceId={active.id}
          currency={currency}
          defaultDate={formState.date}
          event={formState.event}
        />
      ) : null}

      {active && detail ? (
        <EventDetailSheet
          key={detail.id}
          open
          onClose={() => setDetail(null)}
          workspaceId={active.id}
          currency={currency}
          event={detail}
          canEdit={canEdit}
          onEdit={(event) => {
            setDetail(null);
            setFormState({ date: event.date, event });
          }}
        />
      ) : null}
    </div>
  );
}
