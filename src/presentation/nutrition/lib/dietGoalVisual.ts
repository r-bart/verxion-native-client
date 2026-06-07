/**
 * Maps a diet `goal` token (the API enum, `string | null`) to its visual
 * vocabulary: the icon-bubble tint + the icon to render. The read-model carries
 * the goal as a raw token; unknown / null tokens fall back to a neutral target
 * glyph so the card never breaks on an unmapped value. The display LABEL comes
 * from `goalLabel` (i18n) — this is colour + glyph only.
 *
 * Colours are drawn from the shared palette (no new tokens): fat_loss → lava,
 * muscle_gain → body (cyan), maintenance → neutral (amber), recomp → insight
 * (purple), health → up (green). Mirrors the handoff `DZ_GOAL` vocabulary.
 */
import {
  Flame,
  TrendingUp,
  Target,
  Repeat,
  HeartPulse,
  type LucideIcon,
} from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";

export interface DietGoalVisual {
  /** Icon-bubble background tint. */
  bg: string;
  /** Icon + accent colour. */
  color: string;
  Icon: LucideIcon;
}

const GOALS: Record<string, DietGoalVisual> = {
  fat_loss: { bg: glass.lavaBg, color: glass.lava, Icon: Flame },
  muscle_gain: {
    bg: palette.body.background,
    color: palette.body.text,
    Icon: TrendingUp,
  },
  maintenance: {
    bg: palette.neutral.background,
    color: palette.neutral.text,
    Icon: Target,
  },
  recomp: {
    bg: palette.insight.background,
    color: palette.insight.text,
    Icon: Repeat,
  },
  health: { bg: glass.upBg, color: glass.up, Icon: HeartPulse },
};

const FALLBACK: DietGoalVisual = {
  bg: palette.neutral.background,
  color: palette.neutral.text,
  Icon: Target,
};

export function dietGoalVisual(goal: string | null): DietGoalVisual {
  return (goal != null && GOALS[goal]) || FALLBACK;
}
