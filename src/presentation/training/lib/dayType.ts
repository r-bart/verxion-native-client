/**
 * Day-type visual vocabulary — color, tint and icon per training day type, the
 * shared language of the rotation across the hero, spine, next-session card and
 * day detail. Labels come from i18n (`training.dayType.*`); this map owns only
 * the visuals. Mirrors the handoff's `DAY_TYPE`.
 */
import { Dumbbell, Rows3, Footprints, Moon, Target, type LucideIcon } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import type { DayType, DayKind } from "@/domain/training/models/RoutineDashboard";

export const DAY_TYPE: Record<DayType, { color: string; bg: string; Icon: LucideIcon }> = {
  push: { color: glass.lava, bg: glass.lavaBg, Icon: Dumbbell },
  pull: { color: palette.body.text, bg: palette.body.background, Icon: Rows3 },
  legs: { color: palette.neutral.text, bg: palette.neutral.background, Icon: Footprints },
  core: { color: palette.insight.text, bg: palette.insight.background, Icon: Target },
  rest: { color: palette.insight.text, bg: palette.insight.background, Icon: Moon },
};

type ChipVisual = { color: string; bg: string; Icon: LucideIcon };

/**
 * TEMPORARY chip vocabulary for the API's {@link DayKind} taxonomy. The full
 * per-kind icon/color system (cardio, deload, mobility, active_rest,
 * conditioning, technique) is a deferred design follow-up; until then every
 * active kind falls to the lava "workout" visual and the two rest kinds to the
 * calm moon. Labels come from i18n (`training.dayType.{kind}`).
 */
const WORKOUT_CHIP: ChipVisual = { color: glass.lava, bg: glass.lavaBg, Icon: Dumbbell };
const REST_CHIP: ChipVisual = { color: palette.insight.text, bg: palette.insight.background, Icon: Moon };

export function dayKindChip(kind: DayKind): ChipVisual {
  return kind === "rest" || kind === "active_rest" ? REST_CHIP : WORKOUT_CHIP;
}
