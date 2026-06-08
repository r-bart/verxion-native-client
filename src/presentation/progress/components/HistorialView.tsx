/**
 * HistorialView — lens 3 of Progreso ("¿de dónde vengo?"): the Cinta, the
 * multi-lane scrubbable timeline of weight / volume / adherence with a per-lane
 * focus mode. Owns its own read-model (`/progress/history`) so it stays
 * self-contained. `fresh`/`empty` shows the "story is being written" note; errors
 * retry. (The milestone reel — "Carrete" — was dropped: low value, flaky data.)
 */
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useProgressHistory } from "../hooks/useProgressHistory";
import { CintaView } from "./CintaView";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 14 }}>
      {children}
    </View>
  );
}

export function HistorialView() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useProgressHistory();

  if (isLoading) {
    return (
      <Centered>
        <ActivityIndicator color={glass.ink2} />
      </Centered>
    );
  }

  if (isError || !data) {
    return (
      <Centered>
        <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
          {t("common.somethingWentWrong")}
        </Text>
        <Pressable onPress={() => refetch()} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
          <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
            <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("common.retry")}</Text>
          </View>
        </Pressable>
      </Centered>
    );
  }

  // Anything short of a full history (fresh arranque OR empty) shows the
  // "story is being written" note rather than dropping into empty lanes.
  if (data.dataState !== "full" || data.series.length === 0) {
    return (
      <Centered>
        <History size={28} color={glass.ink3} strokeWidth={2} />
        <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: glass.ink2, textAlign: "center" }}>
          {t("progress.historial.writing")}
        </Text>
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CintaView history={data} />
    </View>
  );
}
