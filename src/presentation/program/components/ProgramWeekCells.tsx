/**
 * ProgramWeekCells — the row of week pills on the library card and detail hero.
 * Completed weeks fill lava; for an active program the current week fills
 * partially by `weekFrac`; a completed program fills every cell. Renders nothing
 * for an open-ended program (`totalWeeks <= 0`) — the caller shows "semana N"
 * without a denominator instead. Program mirror of `DietWeekCells`.
 */
import { View } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import type { ProgramOverview } from "@/domain/program/models/Program";

export function ProgramWeekCells({
  program,
  height = 5,
}: {
  program: ProgramOverview;
  height?: number;
}) {
  const { week, totalWeeks, weekFrac, status } = program;
  if (totalWeeks <= 0) return null;
  const cells = Math.max(totalWeeks, week);
  const completed = status === "completed";
  const partial =
    !completed && weekFrac != null && weekFrac > 0 && weekFrac < 1 ? weekFrac : null;

  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: cells }).map((_, i) => {
        const done = completed || i < week - 1;
        const now = !completed && i === week - 1;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height,
              borderRadius: 9999,
              overflow: "hidden",
              backgroundColor: done ? glass.lava : "rgba(255,255,255,0.10)",
            }}
          >
            {now && partial != null && (
              <View style={{ height: "100%", width: `${Math.max(9, partial * 100)}%`, backgroundColor: glass.lava }} />
            )}
            {now && partial == null && (
              <View style={{ height: "100%", width: "100%", backgroundColor: glass.lava, opacity: 0.5 }} />
            )}
          </View>
        );
      })}
    </View>
  );
}
