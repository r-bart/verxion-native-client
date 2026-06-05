/**
 * RoutineRow — the active routine's week + adherence ("RUTINA · SEMANA 3 / 6",
 * name, and an adherence chip). Open over the bloom, per the `01-Hoy` handoff.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Dumbbell, TrendingUp } from "lucide-react-native";
import type { RoutineProgress } from "@/domain/today/models/TodayDashboard";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SectionLabel } from "./SectionLabel";

export function RoutineRow({ routine }: { routine: RoutineProgress }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>
        {`${t("today.routineLabel")} · ${t("today.routineWeek", {
          week: routine.week,
          total: routine.totalWeeks,
        })}`}
      </SectionLabel>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Dumbbell size={18} color={glass.lava} strokeWidth={2} />
        <Text
          style={{ flex: 1, fontFamily: sans(700), fontSize: 16, color: glass.white, letterSpacing: -0.32 }}
          numberOfLines={1}
        >
          {routine.name}
        </Text>
        {routine.adherenceScore != null && (
          <Chip
            tone="up"
            icon={<TrendingUp size={12} color={glass.up} strokeWidth={2.5} />}
            label={`${routine.adherenceScore} /${routine.adherenceMax}`}
          />
        )}
      </View>
    </View>
  );
}
