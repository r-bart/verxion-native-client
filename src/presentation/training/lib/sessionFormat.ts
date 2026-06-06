/**
 * sessionFormat — locale-aware display formatters for the session-detail screen.
 * Lives in presentation (the layer that owns locale formatting): the domain model
 * + the infrastructure mapper carry raw numbers and ISO dates; these turn them
 * into the strings the UI shows, switching on the active i18n language.
 *
 * Hand-rolled (no `Intl`) on purpose: Hermes-iOS has gaps in `Intl` that Node/Jest
 * masks, so the weekday/month tables + decimal rule are explicit for the two
 * supported locales. Pass `i18n.language` from `useTranslation()` as `locale`.
 */
import type {
  SessionPrescription,
  SessionSet,
} from "@/domain/training/models/SessionDetailView";

type Lang = "es" | "en";

const WEEKDAYS: Record<Lang, string[]> = {
  es: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};
const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
const MONTHS: Record<Lang, string[]> = {
  es: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

function lang(locale: string): Lang {
  return locale.toLowerCase().startsWith("es") ? "es" : "en";
}

/** Up to one decimal; comma in es, point in en. Integers stay integer. */
export function fmtDecimal(locale: string, n: number): string {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return lang(locale) === "es" ? s.replace(".", ",") : s;
}

/** kg → tonnes string (e.g. 16300 → "16,3" / "16.3"). Unit owned by the caller. */
export function fmtTonnes(locale: string, kg: number): string {
  return fmtDecimal(locale, kg / 1000);
}

/** seconds → whole minutes string. */
export function fmtMinutes(sec: number): string {
  return String(Math.round(sec / 60));
}

/** A logged set, e.g. "82,5 × 8". */
export function fmtSet(locale: string, set: SessionSet): string {
  return `${fmtDecimal(locale, set.weight)} × ${set.reps}`;
}

/** The plan target, e.g. "4×6-8 · RIR 2"; "" when there is no prescription. */
export function fmtPrescription(
  locale: string,
  p: SessionPrescription | null
): string {
  if (!p) return "";
  const parts: string[] = [];
  if (p.sets != null && p.reps) parts.push(`${p.sets}×${p.reps}`);
  else if (p.reps) parts.push(p.reps);
  if (p.rir != null) parts.push(`RIR ${fmtDecimal(locale, p.rir)}`);
  return parts.join(" · ");
}

/** A completion instant → "Sábado · 31 may" / "Saturday · 31 May"; "" when null. */
export function fmtSessionDate(locale: string, iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const l = lang(locale);
  return `${WEEKDAYS[l][d.getDay()]} · ${d.getDate()} ${
    MONTHS[l][d.getMonth()]
  }`;
}

/** Feed row heading → short weekday + day, e.g. "Sáb 31" / "Sat 31"; "" when null. */
export function fmtFeedDay(locale: string, iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${WEEKDAYS_SHORT[lang(locale)][d.getDay()]} ${d.getDate()}`;
}

/** Localized short month for an instant, e.g. "may" / "May"; "" when null. */
export function fmtFeedMonth(locale: string, iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return MONTHS[lang(locale)][d.getMonth()];
}

/**
 * A block's first→last span. Same month → "12-31 may"; spanning months →
 * "6 ene – 28 feb"; spanning years the year is appended on both ends →
 * "28 dic 2025 – 5 ene 2026". Empty string when either bound is missing/invalid.
 */
export function fmtDateRange(
  locale: string,
  startIso: string,
  endIso: string
): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const l = lang(locale);
  const sameYear = s.getFullYear() === e.getFullYear();
  const eMonth = MONTHS[l][e.getMonth()];
  if (sameYear && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}-${e.getDate()} ${eMonth}`;
  }
  const sYear = sameYear ? "" : ` ${s.getFullYear()}`;
  const eYear = sameYear ? "" : ` ${e.getFullYear()}`;
  return `${s.getDate()} ${
    MONTHS[l][s.getMonth()]
  }${sYear} – ${e.getDate()} ${eMonth}${eYear}`;
}
