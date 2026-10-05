import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { Switch } from '@/shared/ui/switch';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveWorkspace } from '@/modules/workspace/hooks/useWorkspaces';
import { useReminderMutations, useReminders } from '../hooks/useReminders';
import { ReminderFormSheet } from '../components/ReminderFormSheet';
import { MAX_REMINDERS, REMINDER_KINDS } from '../constants/reminder.constants';
import { describeDays, formatReminderTime } from '../utils/reminderSchedule';
import type { IReminder } from '../types/reminder.types';

/**
 * Recordatorios (R-13): avisos para registrar gastos e ingresos. Llegan a la campana de
 * notificaciones a la hora local elegida, aunque la app esté cerrada.
 */
export function RemindersPage() {
  const { active } = useActiveWorkspace();
  const workspaceId = active?.id ?? '';
  const { data: reminders = [], isLoading } = useReminders(workspaceId);
  const { toggle } = useReminderMutations(workspaceId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<IReminder | undefined>(undefined);

  const open = (reminder?: IReminder) => {
    setEditing(reminder);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.notifications}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Recordatorios</h1>
      </header>

      <p className="text-body text-muted-foreground">
        Te avisamos para que registres tus movimientos y tus finanzas estén siempre al día.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          emoji="⏰"
          title="Sin recordatorios"
          description="Crea uno, por ejemplo todos los días a las 8:00 p. m., para registrar tus gastos."
          action={
            <Button onClick={() => open()}>
              <Plus />
              Crear recordatorio
            </Button>
          }
        />
      ) : (
        <section className="flex flex-col gap-2">
          {reminders.map((r) => {
            const kind = REMINDER_KINDS.find((k) => k.value === r.kind);
            return (
              <Card key={r.id} className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => open(r)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="text-2xl">{kind?.emoji}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-title font-semibold text-foreground">
                      {formatReminderTime(r.time)}
                    </span>
                    <span className="truncate text-caption text-muted-foreground">
                      {kind?.label} · {describeDays(r.days)}
                    </span>
                  </span>
                </button>
                <Switch
                  label={r.enabled ? 'Desactivar recordatorio' : 'Activar recordatorio'}
                  checked={r.enabled}
                  disabled={toggle.isPending}
                  onChange={(enabled) => toggle.mutate({ id: r.id, enabled })}
                />
              </Card>
            );
          })}
        </section>
      )}

      {reminders.length > 0 && reminders.length < MAX_REMINDERS ? (
        <Button variant="secondary" onClick={() => open()}>
          <Plus />
          Nuevo recordatorio
        </Button>
      ) : null}

      <ReminderFormSheet
        key={editing?.id ?? 'new'}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        workspaceId={workspaceId}
        reminder={editing}
      />
    </div>
  );
}
