/**
 * Weekly-calendar day-kind vocabulary (handoff `PG_SLOT`): tinted heatmap cells —
 * training = lava, refeed = amber, custom = cyan, rest = hollow (no fill, dashed).
 * No per-cell glow (reserved for the lava CTA). Labels come from i18n
 * (`program.detail.dayKind.<kind>`).
 */
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import type { ProgramDayKind } from "@/domain/program/models/Program";

export interface ProgramDayVisual {
  /** Cell fill (null for rest → hollow). */
  fill: string | null;
  /** Cell border. */
  line: string;
  /** Legend dot / accent colour. */
  color: string;
}

const DAY: Record<ProgramDayKind, ProgramDayVisual> = {
  training: { fill: "rgba(255,98,98,0.28)", line: "rgba(255,98,98,0.58)", color: glass.lava },
  refeed: { fill: "rgba(255,185,0,0.24)", line: "rgba(255,185,0,0.54)", color: palette.neutral.text },
  custom: { fill: "rgba(0,210,255,0.24)", line: "rgba(0,210,255,0.52)", color: palette.body.text },
  rest: { fill: null, line: "rgba(155,89,182,0.32)", color: palette.insight.text },
};

export function programDayVisual(kind: ProgramDayKind): ProgramDayVisual {
  return DAY[kind] ?? DAY.custom;
}

/** The 7 schedule day-kinds in i18n display order (Mon→Sun keys live in i18n). */
export const PROGRAM_DOW_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
