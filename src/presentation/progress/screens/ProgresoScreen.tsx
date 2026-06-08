/**
 * ProgresoScreen — the landing and spine of the Progreso tab. Header (title) over
 * a sliding `SegmentedControl` with three lenses: Resumen (¿voy bien?), Métricas
 * (¿qué dicen los datos?), Historial (¿de dónde vengo?). State-gated like Hoy /
 * diet-dashboard: `empty` → blank-slate invite (no segmented), `fresh` → a banner
 * over the lenses, `full` → everything. Resumen is built; Métricas/Historial are
 * placeholders pending their own passes. Read-only — every "edit" affordance is a
 * local view-state or a handoff to the agent, never a write.
 */
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SegmentedControl } from "@/presentation/_shared/components/SegmentedControl";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { useProgressOverview } from "../hooks/useProgressOverview";
import { useProgresoSegment } from "../hooks/useProgresoSegment";
import { ResumenView } from "../components/ResumenView";
import { MetricasView } from "../components/MetricasView";
import { HistorialView } from "../components/HistorialView";

function FreshBanner() {
  const { t } = useTranslation();
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
      <GlassSurface radius={14} fallbackFill={glass.fill2} style={{ padding: 12, gap: 3 }}>
        <Text style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}>
          {t("progress.states.freshTitle")}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 11, lineHeight: 16, color: glass.ink2 }}>
          {t("progress.states.freshBody")}
        </Text>
      </GlassSurface>
    </View>
  );
}

/** Read failed — a distinct surface from the empty invite, with a retry. */
function ProgresoError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 14 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
        {t("common.somethingWentWrong")}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>
            {t("common.retry")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export function ProgresoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { segment, setSegment, options } = useProgresoSegment();
  const { data: overview, isLoading, isError, refetch } = useProgressOverview();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <Text style={{ fontFamily: sans(700), fontSize: 30, color: glass.white, letterSpacing: -1.05 }}>
            {t("progress.title")}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={glass.ink2} />
          </View>
        ) : isError || !overview ? (
          <ProgresoError onRetry={() => refetch()} />
        ) : overview.dataState === "empty" ? (
          <EmptyState
            icon={<Sparkles size={30} color={glass.lava} strokeWidth={2} />}
            title={t("progress.states.emptyTitle")}
            body={t("progress.states.emptyBody")}
          />
        ) : (
          <>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <SegmentedControl options={options} value={segment} onChange={setSegment} />
            </View>

            {overview.dataState === "fresh" && <FreshBanner />}

            <View style={{ flex: 1 }}>
              {segment === "resumen" ? (
                <ResumenView
                  overview={overview}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  onOpenMeasure={(metric) => router.push(`/progress/medida/${metric}` as Href)}
                  onOpenExercise={(slug) => router.push(`/progress/ejercicio/${slug}` as Href)}
                />
              ) : segment === "metricas" ? (
                <MetricasView
                  overview={overview}
                  onOpenMeasure={(metric) => router.push(`/progress/medida/${metric}` as Href)}
                />
              ) : (
                <HistorialView />
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
