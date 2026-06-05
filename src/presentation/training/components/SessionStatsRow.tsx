/**
 * SessionStatsRow — the three-stat block recap atop the Sesiones segment:
 * sessions · block volume · trend vs. the previous week, split by hairlines.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { SessionsSummaryStats } from "@/domain/training/models/SessionsSummary";

function Stat({ value, label, valueColor }: { value: string; label: string; valueColor?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 18, color: valueColor ?? glass.white, letterSpacing: -0.4 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: mono(500), fontSize: 9.5, letterSpacing: 0.6, color: glass.ink3, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

function Hairline() {
  return <View style={{ width: 1, alignSelf: "stretch", backgroundColor: glass.stroke, marginVertical: 4 }} />;
}

export function SessionStatsRow({ stats }: { stats: SessionsSummaryStats }) {
  const { t } = useTranslation();
  const trend = `${stats.trendPct >= 0 ? "+" : ""}${stats.trendPct}%`;

  return (
    <GlassSurface radius={18} style={{ flexDirection: "row", paddingVertical: 14, paddingHorizontal: 8 }}>
      <Stat value={String(stats.sessions)} label={t("training.sessionsSummary.statSessions")} />
      <Hairline />
      <Stat value={stats.blockVolume} label={t("training.sessionsSummary.statVolume")} />
      <Hairline />
      <Stat value={trend} label={t("training.sessionsSummary.statTrend")} valueColor={stats.trendPct >= 0 ? glass.up : glass.lava} />
    </GlassSurface>
  );
}
