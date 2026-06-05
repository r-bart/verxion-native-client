/**
 * Visual + copy mapping for the five daily fronts. Keeps the screen components
 * declarative: a front key resolves to its icon, brand color, tint, i18n label,
 * and its formatted display value.
 */
import type { ComponentType } from "react";
import { Dumbbell, Utensils, Droplet, Footprints, Pill, type LucideProps } from "lucide-react-native";
import type { TFunction } from "i18next";
import type { DayFront, DayFrontKey } from "@/domain/today/models/TodayDashboard";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { formatNumber } from "./format";

export type FrontVisual = {
  Icon: ComponentType<LucideProps>;
  color: string;
  tint: string;
};

export const FRONT_VISUALS: Record<DayFrontKey, FrontVisual> = {
  training: { Icon: Dumbbell, color: glass.lava, tint: glass.lavaBg },
  // Coral/orange — distinct from training's lava red so the two adjacent ring
  // segments don't read as one arc.
  nutrition: { Icon: Utensils, color: "#FF8A4C", tint: "#241608" },
  water: { Icon: Droplet, color: palette.body.primary, tint: palette.body.background },
  steps: { Icon: Footprints, color: palette.neutral.primary, tint: palette.neutral.background },
  supplements: { Icon: Pill, color: palette.insight.primary, tint: palette.insight.background },
};

/** Localized front label (e.g. "Entreno"). */
export function frontLabel(key: DayFrontKey, t: TFunction): string {
  return t(`today.fronts.${key}`);
}

/** Formatted value shown to the right of a front (e.g. "2.250 / 2.250 kcal"). */
export function frontValue(front: DayFront, t: TFunction, lang: string): string {
  if (front.status) return t(`today.frontStatus.${front.status}`);
  if (front.current == null || front.target == null) return "—";

  const current = formatNumber(front.current, lang);
  const target = formatNumber(front.target, lang);
  const suffix = front.unit === "kcal" ? " kcal" : front.unit === "L" ? " L" : "";
  return `${current} / ${target}${suffix}`;
}

/**
 * Compact value for the narrow fronts column beside the ring: current + unit,
 * no "/ target" (the ring conveys completion). Count fronts keep the ratio
 * (it's short and meaningful).
 */
export function frontValueCompact(front: DayFront, t: TFunction, lang: string): string {
  if (front.status) return t(`today.frontStatus.${front.status}`);
  if (front.current == null) return "—";

  const current = formatNumber(front.current, lang);
  switch (front.unit) {
    case "kcal":
      return `${current} kcal`;
    case "L":
      return `${current} L`;
    case "count":
      return front.target != null ? `${current} / ${formatNumber(front.target, lang)}` : current;
    default:
      return current;
  }
}
