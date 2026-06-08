/**
 * ResumenSectionCard — one domain section of the Resumen lens: a glass card with
 * a tinted icon bubble + label, the big current value in the domain color, a
 * delta chip (green when the move is good), a mini sparkline, and an optional
 * goal sub-chip. Tapping a body/activity metric opens its "Detalle de medida".
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
import { formatValue, formatNumber, formatDelta } from "../lib/format";
import { Sparkline } from "./Sparkline";

export function ResumenSectionCard({
  metric,
  onPress,
}: {
  metric: ProgressMetric;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const visual = metricVisual(metric.key);
  const tone = TONE_COLOR[visual.tone];
  const Icon = visual.icon;
  const navigable = visual.measure && onPress != null;

  const delta = formatDelta(
    metric.delta,
    metric.unit,
    metric.dec,
    metric.goodDown,
    t("progress.states.stable"),
  );

  const goalChip =
    metric.goal != null && metric.now != null
      ? t("progress.resumen.goalRemaining", {
          goal: formatNumber(metric.goal, metric.dec),
          diff: formatNumber(Math.abs(metric.now - metric.goal), metric.dec),
        })
      : null;

  const body = (
    <GlassSurface radius={18} style={{ padding: 15, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconBubble bg={tone.tint} size={36}>
          <Icon size={18} color={tone.ink} strokeWidth={2} />
        </IconBubble>
        <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 14, color: glass.white }}>
          {metricLabel(t, metric.key)}
        </Text>
        {navigable && <ChevronRight size={18} color={glass.ink3} strokeWidth={2} />}
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 27,
              letterSpacing: -1,
              color: tone.ink,
            }}
          >
            {formatValue(metric.now, metric.unit, metric.dec)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Chip tone={delta.tone} label={delta.text} />
            {goalChip && (
              <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>
                {goalChip}
              </Text>
            )}
          </View>
        </View>
        <Sparkline points={metric.spark} color={tone.ink} />
      </View>
    </GlassSurface>
  );

  if (!navigable) return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      {body}
    </Pressable>
  );
}
