/**
 * ResumenView — lens 1 of Progreso ("¿voy bien?"). A glanceable vertical stack:
 * the latest strength PR up top (the "Fuerza" card), then one section per domain
 * metric. Reorder/hide (the handoff's local "Editar" mode) is a later additive
 * pass; v1 renders the API order. Each lens owns its own scroll.
 */
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProgressOverview } from "@/domain/progress/models/Progress";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { metricVisual } from "../lib/metricVisual";
import { ResumenSectionCard } from "./ResumenSectionCard";
import { StrengthCard } from "./StrengthCard";

type Props = {
  overview: ProgressOverview;
  refreshing?: boolean;
  onRefresh?: () => void;
  onOpenMeasure?: (metric: string) => void;
  onOpenExercise?: (slug: string) => void;
};

export function ResumenView({
  overview,
  refreshing,
  onRefresh,
  onOpenMeasure,
  onOpenExercise,
}: Props) {
  const insets = useSafeAreaInsets();
  const pr = overview.strengthPr;
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 64, gap: 12 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh
          ? <GlassRefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          : undefined
      }
    >
      {pr && (
        <StrengthCard
          pr={pr}
          onPress={onOpenExercise ? () => onOpenExercise(pr.slug) : undefined}
        />
      )}

      {overview.metrics.map((metric) => (
        <ResumenSectionCard
          key={metric.key}
          metric={metric}
          onPress={
            onOpenMeasure && metricVisual(metric.key).measure
              ? () => onOpenMeasure(metric.key)
              : undefined
          }
        />
      ))}

      <View style={{ height: 8 }} />
    </ScrollView>
  );
}
