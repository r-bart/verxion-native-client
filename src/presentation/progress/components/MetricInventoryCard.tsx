/**
 * MetricInventoryCard — one tappable tile in the Métricas grid: a tinted bubble,
 * the trend delta chip, a caret that flips when open, the value in the domain
 * color, the label, and a mini sparkline. The card always fills its slot
 * (`alignSelf: "stretch"`); the parent owns the column math (a `flex:1` cell per
 * tile), so the tile never sizes to its own content. Tapping toggles the
 * in-place drill-down below the group.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react-native";
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
  open,
  onToggle,
}: {
  metric: ProgressMetric;
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
      // Fill the parent cell. The grid pins the column width (flex:1 cell), not
      // the tile — a pixel `width` here would be treated as a soft flex-basis and
      // get overridden by content min-size (wide values pushed the tile past its
      // slot, narrow ones shrank it → ragged columns). Stretching sidesteps that.
      style={({ pressed }) => ({ alignSelf: "stretch", opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          // Plain translucent tile (not GlassSurface): the native iOS 26
          // GlassView shrink-wraps its content and ignores the slot width. A
          // plain View fills the cell; at this size fill+stroke reads as glass.
          borderRadius: 16,
          padding: 13,
          gap: 10,
          backgroundColor: open ? glass.fill2 : glass.fill,
          borderColor: open ? glass.lavaBorder : glass.stroke,
          borderWidth: 1,
          overflow: "hidden",
        }}
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
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <View style={{ gap: 1, flexShrink: 1, minWidth: 0 }}>
            <Text
              style={{ fontFamily: sans(700), fontSize: 20, letterSpacing: -0.6, color: tone.ink, fontVariant: ["tabular-nums"] }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {formatValue(metric.now, metric.unit, metric.dec)}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }} numberOfLines={1}>
              {metricLabel(t, metric.key)}
            </Text>
          </View>
          <Sparkline points={metric.spark} color={tone.ink} width={62} height={24} />
        </View>
      </View>
    </Pressable>
  );
}
