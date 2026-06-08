/**
 * MetricExpand — the in-place drill-down for one metric in the Métricas lens:
 * header (bubble + label + value + delta), a chart from the metric's sparkline
 * window + goal line, the máx·mín·objetivo/media stats, and (for the 6 body/
 * activity metrics) a "ver detalle ›" jump to the full Detalle de medida. Renders
 * full-width below its group; only one is open at a time. No extra fetch — paints
 * the overview window the screen already has; the full screen carries the rest.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgressMetric } from "@/domain/progress/models/Progress";
import { metricVisual, metricLabel, TONE_COLOR } from "../lib/metricVisual";
import { formatValue, formatDelta } from "../lib/format";
import { MeasureChart } from "./MeasureChart";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.4, color: glass.ink3 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function MetricExpand({
  metric,
  width,
  onOpenDetail,
}: {
  metric: ProgressMetric;
  width: number;
  onOpenDetail?: () => void;
}) {
  const { t } = useTranslation();
  const visual = metricVisual(metric.key);
  const tone = TONE_COLOR[visual.tone];
  const Icon = visual.icon;
  const delta = formatDelta(metric.delta, metric.unit, metric.dec, metric.goodDown, t("progress.states.stable"));
  const fourth =
    metric.goal != null
      ? { label: t("progress.measure.goal"), value: formatValue(metric.goal, metric.unit, metric.dec) }
      : {
          label: t("progress.measure.average"),
          value:
            metric.max != null && metric.min != null
              ? formatValue((metric.max + metric.min) / 2, metric.unit, metric.dec)
              : "—",
        };

  return (
    <GlassSurface radius={16} fallbackFill={glass.fill2} style={{ padding: 16, gap: 14, marginTop: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconBubble bg={tone.tint} size={32}>
          <Icon size={16} color={tone.ink} strokeWidth={2} />
        </IconBubble>
        <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 14, color: glass.white }}>
          {metricLabel(t, metric.key)}
        </Text>
        <Text style={{ fontFamily: sans(700), fontSize: 18, color: tone.ink }}>
          {formatValue(metric.now, metric.unit, metric.dec)}
        </Text>
        <Chip tone={delta.tone} label={delta.text} />
      </View>

      <MeasureChart values={metric.spark} color={tone.ink} goal={metric.goal} width={width - 32} height={120} />

      <View style={{ flexDirection: "row" }}>
        <Stat label={t("progress.measure.max")} value={formatValue(metric.max, metric.unit, metric.dec)} />
        <Stat label={t("progress.measure.min")} value={formatValue(metric.min, metric.unit, metric.dec)} />
        <Stat label={fourth.label} value={fourth.value} />
      </View>

      {visual.measure && onOpenDetail && (
        <Pressable
          onPress={onOpenDetail}
          accessibilityRole="button"
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 4, opacity: pressed ? glass.pressOpacity : 1 })}
        >
          <Text style={{ fontFamily: sans(600), fontSize: 12, color: glass.lava }}>{t("progress.metricas.viewDetail")}</Text>
          <ChevronRight size={14} color={glass.lava} strokeWidth={2.2} />
        </Pressable>
      )}
    </GlassSurface>
  );
}
