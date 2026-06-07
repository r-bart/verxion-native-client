/**
 * Status visual vocabulary for Programas. Status colour mirrors the handoff
 * `PG_STATE` (active=lava, draft=insight, paused=neutral, completed=up); labels
 * come from i18n (`program.status.<status>`).
 */
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import type { ProgramStatus } from "@/domain/program/models/Program";

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
