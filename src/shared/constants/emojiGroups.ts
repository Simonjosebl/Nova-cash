/**
 * Categorías del selector de emojis (Cap. 3.13 / R-10), en el orden de los teclados.
 * `group` es el número de grupo de Unicode/Emojibase; el grupo 2 (componentes) se omite.
 */
export const EMOJI_GROUPS = [
  { group: 0, label: 'Caras', icon: '😀' },
  { group: 1, label: 'Personas', icon: '👋' },
  { group: 3, label: 'Naturaleza', icon: '🐶' },
  { group: 4, label: 'Comida', icon: '🍔' },
  { group: 5, label: 'Viajes', icon: '✈️' },
  { group: 6, label: 'Actividades', icon: '⚽' },
  { group: 7, label: 'Objetos', icon: '💡' },
  { group: 8, label: 'Símbolos', icon: '❤️' },
  { group: 9, label: 'Banderas', icon: '🏳️' },
] as const;

/**
 * Versión de emoji más reciente que se muestra. Las posteriores aún no existen en muchos
 * teléfonos y se verían como cuadros vacíos.
 */
export const MAX_EMOJI_VERSION = 15.1;
