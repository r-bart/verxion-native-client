/**
 * es-ES number formatting for Nutrición, written by hand (NO Intl) — Hermes-iOS
 * ships an incomplete Intl and `Number.toLocaleString` is unreliable there, so
 * we format manually like the Entreno `sessionFormat` helpers. es-ES uses a dot
 * as the thousands separator and a comma as the decimal separator.
 */

/** Integer with a dot thousands separator: 2250 → "2.250". Non-finite → "—"
 *  (guards against a field the API unexpectedly omits surfacing as "NaN"). */
export function nInt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** One-decimal litres with a comma decimal separator: 2.4 → "2,4". Non-finite → "—". */
export function nL(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(1).replace(".", ",");
}

const ES_MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * Short es-ES date: "2026-05-05" → "5 may 2026". Hand-rolled (no Intl) like the
 * number helpers above. Accepts any value `new Date()` parses (ISO date/datetime);
 * returns null for empty/invalid input so callers can hide the field.
 */
export function dShortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  // Date-only strings ("YYYY-MM-DD") parse as UTC midnight per spec; reading them
  // with local getDate/getMonth shifts a calendar day west of UTC. Pin to local
  // noon so the intended day reads correctly in any timezone.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()} ${ES_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 24h local time "HH:MM" from an ISO datetime; null for empty/invalid input. */
export function dTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
