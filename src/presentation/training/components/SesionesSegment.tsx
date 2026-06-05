/**
 * SesionesSegment — the Entreno landing's "Sesiones" segment: the three-stat
 * block recap, then "Historial reciente" with a "Ver todo" link to the full
 * history and the recent sessions list. Loading → skeleton; error → retry.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useSessionsSummary } from "../hooks/useSessionsSummary";
import { SessionStatsRow } from "./SessionStatsRow";
import { SessionRecapRow } from "./SessionRecapRow";
import { SegmentError } from "./SegmentError";

function Skeleton() {
  return (
    <View style={{ gap: 12 }}>
      <GlassSurface radius={18} style={{ height: 72 }} />
      <View style={{ gap: 8, marginTop: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 60 }} />
        ))}
      </View>
    </View>
  );
}

export function SesionesSegment() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSessionsSummary();

  if (isLoading) return <Skeleton />;
  if (isError || !data) return <SegmentError onRetry={() => refetch()} />;

  return (
    <View style={{ gap: 14 }}>
      <SessionStatsRow stats={data.stats} />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.9, color: glass.ink3, textTransform: "uppercase" }}>
          {t("training.sessionsSummary.recentTitle")}
        </Text>
        <Pressable
          onPress={() => router.push("/workout/sesiones" as Href)}
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1, flexDirection: "row", alignItems: "center", gap: 2 })}
        >
          <Text style={{ fontFamily: sans(600), fontSize: 12, color: glass.lava }}>{t("training.sessionsSummary.seeAll")}</Text>
          <ChevronRight size={14} color={glass.lava} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        {data.recent.map((row) => (
          <SessionRecapRow key={row.id} row={row} />
        ))}
      </View>
    </View>
  );
}
