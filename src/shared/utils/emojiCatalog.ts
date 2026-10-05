import type { Emoji } from 'emojibase';
import { EMOJI_GROUPS, MAX_EMOJI_VERSION } from '@/shared/constants/emojiGroups';

export interface IEmojiItem {
  emoji: string;
  label: string;
  /** Nombre + etiquetas normalizados (sin tildes, minúsculas) para buscar. */
  keywords: string;
}

export interface IEmojiGroup {
  group: number;
  label: string;
  icon: string;
  emojis: IEmojiItem[];
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Agrupa el catálogo de Emojibase por categoría, en orden de teclado. */
export function buildEmojiGroups(data: ReadonlyArray<Emoji>): IEmojiGroup[] {
  const byGroup = new Map<number, IEmojiItem[]>();
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const item of sorted) {
    if (item.group === undefined || item.version > MAX_EMOJI_VERSION) continue;
    const list = byGroup.get(item.group) ?? [];
    list.push({
      emoji: item.emoji,
      label: item.label,
      keywords: normalizeText([item.label, ...(item.tags ?? [])].join(' ')),
    });
    byGroup.set(item.group, list);
  }

  return EMOJI_GROUPS.map((g) => ({ ...g, emojis: byGroup.get(g.group) ?? [] })).filter(
    (g) => g.emojis.length > 0,
  );
}

/** Busca por nombre o etiqueta en español ("perro", "dinero", "corazón"). */
export function searchEmojis(groups: ReadonlyArray<IEmojiGroup>, query: string): IEmojiItem[] {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return groups.flatMap((g) =>
    g.emojis.filter((e) => terms.every((term) => e.keywords.includes(term))),
  );
}

let catalog: Promise<IEmojiGroup[]> | null = null;

/** Carga el catálogo completo (en español) una sola vez y bajo demanda. */
export function loadEmojiCatalog(): Promise<IEmojiGroup[]> {
  catalog ??= import('emojibase-data/es/data.json').then((m) => buildEmojiGroups(m.default));
  return catalog;
}
