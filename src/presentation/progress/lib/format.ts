/**
 * es-ES number formatting for the Progreso lenses. Implemented by hand (not
 * Intl.NumberFormat) on purpose: Hermes on iOS ships an incomplete ICU, so we
 * format digit grouping (".") and the decimal comma (",") ourselves — the same
 * defensive stance as `relativeTime.ts`. The API sends raw numbers + `unit` +
 * `dec` + `goodDown`; the client only paints them.
 */

/** Group thousands with "." and use "," for decimals, honoring `dec` places. */
export function formatNumber(value: number, dec: number): string {
  const fixed = Math.abs(value).toFixed(dec);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = decPart ? `${grouped},${decPart}` : grouped;
  // Only show the minus when the value is still non-zero after rounding — avoids
  // "−0" / "−0,0" for tiny negatives that round to zero at this precision.
  return value < 0 && Number(fixed) !== 0 ? `−${body}` : body;
}

/** A value with its unit, e.g. "81,5 cm" / "8.214" / "92 %". */
export function formatValue(value: number | null, unit: string, dec: number): string {
  if (value == null) return "—";
  const n = formatNumber(value, dec);
  return unit ? `${n} ${unit}` : n;
}

/**
 * Short numeric date "DD/MM" from an ISO date (or date-time) string. Numeric on
 * purpose — locale-agnostic and free of Intl (Hermes gap). Returns "" for blanks.
 */
export function formatShortDate(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}`;
}

export type DeltaTone = "up" | "lava" | "neutral";

export type FormattedDelta = { text: string; tone: DeltaTone };

/**
 * A signed delta string + its semantic tone. `goodDown` flips which direction is
 * "good": a negative weight delta is good, a negative volume delta is not. A
 * delta that rounds to 0 reads as "estable" (neutral).
 */
export function formatDelta(
  delta: number | null,
  unit: string,
  dec: number,
  goodDown: boolean,
  stableLabel: string,
): FormattedDelta {
  if (delta == null) return { text: "—", tone: "neutral" };
  const rounded = Number(delta.toFixed(dec));
  if (rounded === 0) return { text: stableLabel, tone: "neutral" };
  const sign = rounded > 0 ? "+" : "−";
  const body = formatNumber(Math.abs(rounded), dec);
  const text = unit ? `${sign}${body} ${unit}` : `${sign}${body}`;
  const isGood = goodDown ? rounded < 0 : rounded > 0;
  return { text, tone: isGood ? "up" : "lava" };
}
