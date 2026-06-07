/**
 * WeekBar — the block's week progress: "Semana 3 de 6" over a row of week
 * cells. Completed weeks fill lava; the CURRENT week fills partially
 * by `weekFraction` (e.g. Wed ≈ 43%) with a soft glow. Mirrors the handoff's
 * `WeekBlock` (bar variant).
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";
import type { ActiveRoutineSummary } from "@/domain/training/models/RoutineDashboard";

export function WeekBar({ routine }: { routine: ActiveRoutineSummary }) {
  const { t } = useTranslation();
  const { week, weekFraction } = routine;
  // Open-ended routines carry no fixed length; fall back to the current week so
  // the bar renders a filled cell instead of breaking on a null length.
  const weeks = routine.weeks ?? week;
  const partial = weekFraction != null && weekFraction > 0 && weekFraction < 1 ? weekFraction : null;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink2 }}>
        {t("training.routine.week", { week, weeks })}
      </Text>

      <View style={{ flexDirection: "row", gap: 5 }}>
        {Array.from({ length: weeks }).map((_, i) => {
          const done = i < week - 1;
          const now = i === week - 1;
          return (
            <View
              key={`week-${i}`}
              style={{
                flex: 1,
                height: 6,
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
                    borderRadius: 9999,
                    backgroundColor: glass.lava,
                    shadowColor: glass.lava,
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                />
              )}
              {now && partial == null && (
                <View style={{ height: "100%", width: "100%", backgroundColor: glass.lava, opacity: 0.5 }} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
