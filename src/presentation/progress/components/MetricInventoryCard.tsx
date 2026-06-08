/**
 * MetricInventoryCard — one tappable tile in the Métricas grid: a tinted bubble,
 * the trend delta chip, a caret that flips when open, the value in the domain
 * color, the label, and a mini sparkline. Width is driven by the parent so two
 * tiles fill a row edge-to-edge (or one spans full width when a group is odd).
 * Tapping toggles the in-place drill-down below the group.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgressMetric } from "@/domain/progress/models/Progress";
import { metricVisual, metricLabel, TONE_COLOR } from "../lib/metricVisual";
import { formatValue, formatDelta } from "../lib/format";
import { Sparkline } from "./Sparkline";

export function MetricInventoryCard({
  metric,
  width,
  open,
  onToggle,
}: {
  metric: ProgressMetric;
  /** Tile width in px (parent computes a fixed-gutter grid). */
  width: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const tone = TONE_COLOR[metricVisual(metric.key).tone];
  const Icon = metricVisual(metric.key).icon;
  const delta = formatDelta(metric.delta, metric.unit, metric.dec, metric.goodDown, t("progress.states.stable"));

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      testID={`metric-card-${metric.key}`}
      style={({ pressed }) => ({ width, opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        fallbackFill={open ? glass.fill2 : glass.fill}
        style={{ padding: 13, gap: 10, borderColor: open ? glass.lavaBorder : glass.stroke, borderWidth: 1 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconBubble bg={tone.tint} size={30}>
            <Icon size={15} color={tone.ink} strokeWidth={2} />
          </IconBubble>
          <View style={{ width: 8 }} />
          <Chip tone={delta.tone} label={delta.text} />
          <View style={{ flex: 1 }} />
          <ChevronDown
            size={16}
            color={open ? glass.lava : glass.ink3}
            strokeWidth={2}
            style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View style={{ gap: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 20, letterSpacing: -0.6, color: tone.ink }} numberOfLines={1}>
              {formatValue(metric.now, metric.unit, metric.dec)}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }} numberOfLines={1}>
              {metricLabel(t, metric.key)}
            </Text>
          </View>
          <Sparkline points={metric.spark} color={tone.ink} width={Math.min(120, width * 0.42)} height={24} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}
