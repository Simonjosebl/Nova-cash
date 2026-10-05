import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadEmojiCatalog, searchEmojis, type IEmojiGroup } from '@/shared/utils/emojiCatalog';
import { BottomSheet } from './bottom-sheet';
import { Skeleton } from './skeleton';

interface EmojiCatalogSheetProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

/** Cuadrícula que se adapta al ancho: más columnas en computador, menos en móvil. */
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1';

/**
 * Selector completo de emojis (R-10): todo el catálogo de teclado (iPhone, Android,
 * Windows), buscador en español y categorías. Cada dispositivo los dibuja con su estilo.
 */
export function EmojiCatalogSheet({ open, value, onClose, onSelect }: EmojiCatalogSheetProps) {
  const [groups, setGroups] = useState<IEmojiGroup[] | null>(null);
  const [activeGroup, setActiveGroup] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open || groups) return;
    let alive = true;
    void loadEmojiCatalog().then((loaded) => {
      if (alive) setGroups(loaded);
    });
    return () => {
      alive = false;
    };
  }, [open, groups]);

  const results = useMemo(() => (groups ? searchEmojis(groups, query) : []), [groups, query]);
  const current = groups?.find((g) => g.group === activeGroup) ?? groups?.[0];
  const visible = query.trim() ? results : (current?.emojis ?? []);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={close} title="Elige un emoji" size="lg">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: dinero, casa, comida…"
            aria-label="Buscar emoji"
            className="h-12 w-full rounded-md border border-input bg-card pl-12 pr-4 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {groups && !query.trim() ? (
          <div
            role="tablist"
            aria-label="Categorías"
            className="nova-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
          >
            {groups.map((g) => {
              const active = g.group === current?.group;
              return (
                <button
                  key={g.group}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={g.label}
                  onClick={() => setActiveGroup(g.group)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium transition-colors',
                    active
                      ? 'bg-accent/15 text-foreground'
                      : 'text-muted-foreground hover:bg-secondary',
                  )}
                >
                  <span className="text-lg leading-none">{g.icon}</span>
                  <span className="hidden sm:inline">{g.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!groups ? (
          <div className={GRID}>
            {Array.from({ length: 40 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">
            No encontramos emojis con “{query}”.
          </p>
        ) : (
          <div className={GRID} role="listbox" aria-label="Emojis">
            {visible.map((item) => (
              <button
                key={item.emoji}
                type="button"
                role="option"
                aria-selected={item.emoji === value}
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  onSelect(item.emoji);
                  close();
                }}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm text-[1.75rem] leading-none transition-transform hover:scale-110 hover:bg-secondary active:scale-95',
                  item.emoji === value && 'bg-accent/15 ring-1 ring-accent',
                )}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
