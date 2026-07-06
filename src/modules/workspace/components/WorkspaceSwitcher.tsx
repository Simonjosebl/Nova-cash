import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/lib/utils';
import { useActiveWorkspace } from '../hooks/useWorkspaces';

/** Selector de Workspace activo (Cap. 6.6 — Resolución R-01, multi-workspace). */
export function WorkspaceSwitcher() {
  const { active, workspaces, setActive } = useActiveWorkspace();
  const [open, setOpen] = useState(false);

  if (!active) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-sm px-2 py-1 text-body font-semibold text-primary active:scale-[0.98]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-xl">{active.emoji}</span>
        <span className="max-w-[160px] truncate">{active.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute left-0 z-20 mt-2 w-64 rounded-md border border-border bg-card p-2 shadow-modal"
          >
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                role="option"
                aria-selected={w.id === active.id}
                onClick={() => {
                  setActive(w.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-body active:scale-[0.99]',
                  w.id === active.id ? 'bg-secondary' : 'hover:bg-secondary',
                )}
              >
                <span className="text-xl">{w.emoji}</span>
                <span className="flex-1 truncate">{w.name}</span>
                {w.id === active.id ? <Check className="size-4 text-accent" /> : null}
              </button>
            ))}
            <Link
              to={ROUTES.createWorkspace}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-sm px-2 py-2 text-body text-nova-blue hover:bg-secondary"
            >
              <Plus className="size-4" />
              Crear espacio
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
