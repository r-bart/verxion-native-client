/**
 * Shared formatting utilities for the presentation layer.
 * Pure functions — no side effects, no imports.
 */

/** Formats weight to nearest 0.5kg. Returns "BW" for null (bodyweight). */
export function formatWeight(w: number | null): string {
  if (w == null) return "BW";
  const rounded = Math.round(w * 2) / 2;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)}kg`;
}

/** Formats volume in kg, switching to tonnes above 1000. */
export function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}t`;
  return `${Math.round(vol)}kg`;
}

/** Formats a rep range. Shows single number when min === max. */
export function formatRepRange(minReps: number, maxReps: number): string {
  if (minReps === maxReps) return String(minReps);
  return `${minReps}–${maxReps}`;
}
