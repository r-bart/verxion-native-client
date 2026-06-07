/**
 * Maps a `ProgramGoal` token to its visual vocabulary (icon-bubble tint + glyph)
 * from the shared palette — no new tokens. Mirrors the handoff `PG_GOAL`. The
 * display LABEL comes from i18n (`program.goals.<goal>`); this is colour + glyph.
 * Unknown / null falls back to a neutral target glyph so a card never breaks.
 */
import {
  TrendingUp,
  Flame,
  Zap,
  Activity,
  Target,
  Repeat,
  Sparkles,
  Gauge,
  ShieldPlus,
  HeartPulse,
  type LucideIcon,
} from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import type { ProgramGoal } from "@/domain/program/models/Program";

export interface ProgramGoalVisual {
  bg: string;
  color: string;
  Icon: LucideIcon;
}

const body = { bg: palette.body.background, color: palette.body.text };
const neutral = { bg: palette.neutral.background, color: palette.neutral.text };
const insight = { bg: palette.insight.background, color: palette.insight.text };
const lava = { bg: glass.lavaBg, color: glass.lava };
const up = { bg: glass.upBg, color: glass.up };
const health = { bg: palette.health.background, color: palette.health.text };

const GOALS: Record<ProgramGoal, ProgramGoalVisual> = {
  muscle_gain: { ...body, Icon: TrendingUp },
  fat_loss: { ...lava, Icon: Flame },
  strength: { ...neutral, Icon: Zap },
  endurance: { ...body, Icon: Activity },
  maintenance: { ...neutral, Icon: Target },
  recomp: { ...insight, Icon: Repeat },
  general_fitness: { ...up, Icon: Sparkles },
  athletic_performance: { ...lava, Icon: Gauge },
  rehabilitation: { ...insight, Icon: ShieldPlus },
  health: { ...health, Icon: HeartPulse },
};

const FALLBACK: ProgramGoalVisual = { ...neutral, Icon: Target };

export function programGoalVisual(goal: ProgramGoal | null): ProgramGoalVisual {
  return (goal != null && GOALS[goal]) || FALLBACK;
}
