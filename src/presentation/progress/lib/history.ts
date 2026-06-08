/**
 * Pure helpers for the Historial lens. The contract keys everything by week index
 * (0..weeks-1), not dates, so labels are week-relative ("esta semana" / "hace N
 * sem"). No i18n / no side effects here — the components format with `t`.
 */
import type { HistorySeries, HistoryBand } from "@/domain/progress/models/Progress";

/** The phase band containing a week (last match wins on overlap), or null. */
export function bandAtWeek(bands: HistoryBand[], week: number): HistoryBand | null {
  let found: HistoryBand | null = null;
  for (const b of bands) {
    if (week >= b.fromWeek && week <= b.toWeek) found = b;
  }
  return found;
}

/** A series' value at a week (nearest defined point ≤ week, else first), or null. */
export function valueAtWeek(series: HistorySeries, week: number): number | null {
  const pts = series.points;
  if (pts.length === 0) return null;
  const exact = pts.find((p) => p.week === week);
  if (exact) return exact.value;
  // fall back to the closest point by week distance
  let best = pts[0];
  for (const p of pts) {
    if (Math.abs(p.week - week) < Math.abs(best.week - week)) best = p;
  }
  return best.value;
}

/**
 * The series' value to DISPLAY at a week: the last known (non-null) value at or
 * before it, carried forward across gaps — or the first known value for leading
 * nulls. Mirrors `fillForward` so a readout never shows "—" while its curve draws
 * a point. Returns null only when the whole series has no logged value.
 */
export function lastKnownValueAtWeek(series: HistorySeries, week: number): number | null {
  const pts = series.points;
  if (pts.length === 0) return null;
  let carried: number | null = null;
  let firstKnown: number | null = null;
  for (const p of pts) {
    if (p.value != null) {
      if (firstKnown == null) firstKnown = p.value;
      if (p.week <= week) carried = p.value;
    }
  }
  return carried ?? firstKnown;
}

/** Weeks between a week index and "today" (the last week). 0 = current week. */
export function weeksAgo(week: number, totalWeeks: number): number {
  return Math.max(0, totalWeeks - 1 - week);
}

/**
 * Forward-fill nulls in a series for charting: a missing week carries the last
 * known value (or the next known value for leading nulls) instead of cratering
 * the curve to 0. Returns 0s only if the whole series is null.
 */
export function fillForward(values: (number | null)[]): number[] {
  const firstKnown = values.find((v) => v != null) ?? 0;
  let last = firstKnown;
  return values.map((v) => {
    if (v != null) last = v;
    return last;
  });
}
