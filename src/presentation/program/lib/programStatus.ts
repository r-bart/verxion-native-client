/**
 * Status + pace visual vocabulary for Programas. Status colour mirrors the
 * handoff `PG_STATE` (active=lava, draft=insight, paused=neutral, completed=up);
 * labels come from i18n (`program.status.<status>`, `program.pace.<state>`).
 */
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import type { ProgramStatus, PaceState } from "@/domain/program/models/Program";

export function programStatusColor(status: ProgramStatus): string {
  switch (status) {
    case "active":
      return glass.lava;
    case "draft":
      return palette.insight.text;
    case "paused":
      return palette.neutral.text;
    case "completed":
      return glass.up;
    default:
      return glass.ink3;
  }
}

/** Pace chip tone for the `Chip` component ("Vas adelantado" etc.). */
export function paceChipTone(state: PaceState): "up" | "neutral" | "lava" {
  return state === "ahead" ? "up" : state === "behind" ? "lava" : "neutral";
}
