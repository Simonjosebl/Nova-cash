import { describe, expect, it } from 'vitest';
import data from 'emojibase-data/es/data.json';
import { buildEmojiGroups, searchEmojis } from './emojiCatalog';

describe('catálogo de emojis', () => {
  const groups = buildEmojiGroups(data);
  const all = groups.flatMap((g) => g.emojis.map((e) => e.emoji));

  it('incluye el catálogo completo de teclado (más de 1.800 emojis)', () => {
    expect(all.length).toBeGreaterThan(1800);
    expect(all).toEqual(expect.arrayContaining(['😀', '🐶', '💵', '🏦', '🇨🇴']));
  });

  it('ordena las categorías como el teclado y omite componentes', () => {
    expect(groups.map((g) => g.label)).toEqual([
      'Caras',
      'Personas',
      'Naturaleza',
      'Comida',
      'Viajes',
      'Actividades',
      'Objetos',
      'Símbolos',
      'Banderas',
    ]);
  });

  it('busca en español sin tildes', () => {
    expect(searchEmojis(groups, 'perro').map((e) => e.emoji)).toContain('🐶');
    expect(searchEmojis(groups, 'corazon rojo').map((e) => e.emoji)).toContain('❤️');
    expect(searchEmojis(groups, '   ')).toEqual([]);
  });
});
