/**
 * Locale-aware relative time ("2 hours ago", "hace 2 horas"). Implemented by
 * hand (en/es) on purpose: Hermes on iOS does NOT ship `Intl.RelativeTimeFormat`
 * (it's `undefined` → "cannot be used as a constructor"), so we cannot rely on
 * ICU here. Uses `new Date()` (not `Date.now()`) to match the codebase's inline
 * clock reads. Returns "" for a null/blank input.
 */
type RelativeUnit = "year" | "month" | "day" | "hour" | "minute";

const UNITS: [RelativeUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

// [singular, plural] per unit, per supported app language.
const LABELS: Record<"en" | "es", Record<RelativeUnit, [string, string]>> = {
  en: {
    year: ["year", "years"],
    month: ["month", "months"],
    day: ["day", "days"],
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
  },
  es: {
    year: ["año", "años"],
    month: ["mes", "meses"],
    day: ["día", "días"],
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
  },
};

const JUST_NOW: Record<"en" | "es", string> = {
  en: "just now",
  es: "hace un momento",
};

export function formatRelativeTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const lang: "en" | "es" = locale.toLowerCase().startsWith("es") ? "es" : "en";
  const diff = then - new Date().getTime(); // negative = in the past
  const past = diff <= 0;
  const abs = Math.abs(diff);

  for (const [unit, ms] of UNITS) {
    if (abs >= ms) {
      const n = Math.round(abs / ms);
      const [singular, plural] = LABELS[lang][unit];
      const label = n === 1 ? singular : plural;
      if (lang === "es") return past ? `hace ${n} ${label}` : `en ${n} ${label}`;
      return past ? `${n} ${label} ago` : `in ${n} ${label}`;
    }
  }
  return JUST_NOW[lang];
}
