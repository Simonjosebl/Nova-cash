/** Saludo según la hora (Cap. 3.16 / 17 — tono cercano). */
export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
