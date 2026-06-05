/**
 * Locale-aware formatting for the "Hoy" screen. The platform sends structured
 * numbers/timestamps; the app formats them for the user's language (the design
 * shows `2.250` / `2,5` in es, `2,250` / `2.5` in en).
 */

/** Group/format a number for the given language (e.g. 11260 → "11.260" es). */
export function formatNumber(value: number, lang: string): string {
  return new Intl.NumberFormat(lang).format(value);
}

/** ISO timestamp → local `HH:mm`. */
export function formatTime(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
}

/** Capitalize the first letter (weekday names come lowercased in several locales). */
function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** ISO date → short header label like "Martes · 2 jun". */
export function formatDayHeader(isoDate: string, lang: string): string {
  const d = new Date(isoDate);
  const weekday = cap(new Intl.DateTimeFormat(lang, { weekday: "long" }).format(d));
  const dayMonth = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(d);
  return `${weekday} · ${dayMonth}`;
}

/** ISO date → full header title, locale-aware ("Martes, 2 de junio" / "Tuesday, June 2"). */
export function formatDayHeaderFull(isoDate: string, lang: string): string {
  const d = new Date(isoDate);
  const s = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" }).format(d);
  return cap(s);
}

/** Greeting bucket from the device clock. */
export function greetingKey(date = new Date()): "morning" | "afternoon" | "evening" {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 19) return "afternoon";
  return "evening";
}
