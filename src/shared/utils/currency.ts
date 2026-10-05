import {
  CURRENCY_CODES,
  CURRENCY_FLAG_OVERRIDES,
  CURRENCY_NAME_FALLBACKS,
} from '@/shared/constants/currencies';

export interface ICurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  /** Código de país (ISO 3166-1 alfa-2, minúsculas) para la bandera. */
  flag: string;
  /** Nombre del país o región de la bandera, para buscar ("Colombia"). */
  country: string;
}

const hasDisplayNames = typeof Intl.DisplayNames === 'function';
const displayNames = hasDisplayNames ? new Intl.DisplayNames(['es'], { type: 'currency' }) : null;
const regionNames = hasDisplayNames ? new Intl.DisplayNames(['es'], { type: 'region' }) : null;

function currencyName(code: string): string {
  const fallback = CURRENCY_NAME_FALLBACKS[code];
  const name = displayNames?.of(code);
  if (!name || name === code) return fallback ?? code;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function currencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? code;
  } catch {
    return code;
  }
}

/** Información de una moneda: nombre en español, símbolo y bandera. */
export function getCurrencyInfo(code: string): ICurrencyInfo {
  const upper = code.toUpperCase();
  const flag = CURRENCY_FLAG_OVERRIDES[upper] ?? upper.slice(0, 2).toLowerCase();
  let country = '';
  try {
    country = regionNames?.of(flag.toUpperCase()) ?? '';
  } catch {
    country = '';
  }
  return { code: upper, name: currencyName(upper), symbol: currencySymbol(upper), flag, country };
}

let catalog: ReadonlyArray<ICurrencyInfo> | null = null;

/** Todas las monedas vigentes, ordenadas por nombre (se calcula una sola vez). */
export function getAllCurrencies(): ReadonlyArray<ICurrencyInfo> {
  catalog ??= CURRENCY_CODES.map(getCurrencyInfo).sort((a, b) =>
    a.name.localeCompare(b.name, 'es'),
  );
  return catalog;
}

/** Filtra por código, nombre o símbolo, sin distinguir tildes ni mayúsculas. */
export function searchCurrencies(
  list: ReadonlyArray<ICurrencyInfo>,
  query: string,
): ReadonlyArray<ICurrencyInfo> {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const q = normalize(query.trim());
  if (!q) return list;
  return list.filter(
    (c) =>
      normalize(c.code).includes(q) ||
      normalize(c.name).includes(q) ||
      normalize(c.country).includes(q) ||
      c.symbol === query,
  );
}
