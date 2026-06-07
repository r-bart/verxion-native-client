/**
 * Locale labels for the diet-dashboard's enum tokens. The read-model carries the
 * diet goal and supplement timing as raw tokens (`muscle_gain`, `post_workout`);
 * these map them to display strings. Both are typed `string | null` by the API,
 * so unknown tokens fall back to a humanized form — the UI never shows a raw
 * snake_case token. Mirrors the `today/lib/fronts.tsx` label convention.
 */
import type { TFunction } from "i18next";

// Last-resort fallback for tokens the enum maps don't cover: "post_workout" →
// "Post workout". Keeps an unmapped value readable instead of snake_case.
function humanize(token: string): string {
  const s = token.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Diet goal token → label (fat_loss | muscle_gain | maintenance | recomp | health). */
export function goalLabel(goal: string, t: TFunction): string {
  return t(`nutrition.goal.${goal}`, { defaultValue: humanize(goal) });
}

/** Supplement timing token → label (morning | pre_workout | post_workout | evening | with_meal). */
export function supplementTimingLabel(schedule: string, t: TFunction): string {
  return t(`nutrition.supplementTiming.${schedule}`, {
    defaultValue: humanize(schedule),
  });
}
