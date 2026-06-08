/**
 * MetricasView — lens 2 of Progreso ("¿qué dicen los datos?"): the full metric
 * inventory grouped by domain (Cuerpo · Entrenamiento · Nutrición · Actividad),
 * each a 2-col grid of tap-to-expand tiles. Expanding a tile reveals an in-place
 * drill-down (chart + stats) below its group — one open at a time. The 6 body/
 * activity metrics also jump to their full "Detalle de medida". Fed by the
 * overview metrics the mother already loaded (no extra fetch).
 */
import { useState } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { ProgressOverview } from "@/domain/progress/models/Progress";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";
import { metricVisual, METRIC_GROUP_ORDER, type MetricGroup } from "../lib/metricVisual";
import { MetricInventoryCard } from "./MetricInventoryCard";
import { MetricExpand } from "./MetricExpand";

export function MetricasView({
  overview,
  onOpenMeasure,
}: {
  overview: ProgressOverview;
  onOpenMeasure?: (metric: string) => void;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const GUTTER = 10;
  const cardW = width - 32;
  const colW = (cardW - GUTTER) / 2;

  const byGroup = METRIC_GROUP_ORDER.map((group) => ({
    group,
    metrics: overview.metrics.filter((m) => metricVisual(m.key).group === group),
  })).filter((g) => g.metrics.length > 0);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 64, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {byGroup.map(({ group, metrics }) => {
        const openMetric = metrics.find((m) => m.key === openKey) ?? null;
        return (
          <View key={group} style={{ gap: 10 }}>
            <Text style={{ fontFamily: mono(500), fontSize: 11, letterSpacing: 0.6, color: glass.ink3, paddingHorizontal: 4 }}>
              {t(`progress.metricas.groups.${group as MetricGroup}`).toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GUTTER }}>
              {metrics.map((m, i) => {
                // A lone trailing card in an odd group spans the full row.
                const isLastOdd = i === metrics.length - 1 && metrics.length % 2 === 1;
                return (
                  <MetricInventoryCard
                    key={m.key}
                    metric={m}
                    width={isLastOdd ? cardW : colW}
                    open={openKey === m.key}
                    onToggle={() => setOpenKey((cur) => (cur === m.key ? null : m.key))}
                  />
                );
              })}
            </View>
            {openMetric && (
              <MetricExpand
                metric={openMetric}
                width={cardW}
                onOpenDetail={onOpenMeasure ? () => onOpenMeasure(openMetric.key) : undefined}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
