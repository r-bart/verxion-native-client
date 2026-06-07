/**
 * DietWeekCells — the row of week pills shared by the diet library card and the
 * diet-detail hero: completed weeks fill lava, the current week fills partially by
 * `weekFraction`. Keeps the week-progress vocabulary single-sourced across the
 * Nutrición surfaces.
 */
import { View } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";

export function DietWeekCells({
  week,
  weeks,
  weekFraction,
  height = 5,
}: {
  week: number;
  weeks: number;
  weekFraction: number | null;
  height?: number;
}) {
  // Never render fewer cells than the current week, or the "now" cell drops on
  // inconsistent data (week > weeks). Mirrors DietWeekBar's clamp.
  const cells = Math.max(weeks, week);
  const partial =
    weekFraction != null && weekFraction > 0 && weekFraction < 1
      ? weekFraction
      : null;
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: cells }).map((_, i) => {
        const done = i < week - 1;
        const now = i === week - 1;
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
              <View
                style={{
                  height: "100%",
                  width: `${Math.max(9, partial * 100)}%`,
                  backgroundColor: glass.lava,
                }}
              />
            )}
            {now && partial == null && (
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: glass.lava,
                  opacity: 0.5,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
