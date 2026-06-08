/**
 * StrengthCard — the "Fuerza" section of the Resumen. Per the closed product
 * decision (A), this carries the latest strength PR only (no global e1RM index /
 * PR count in v1). Tapping it opens the exercise's "Detalle de ejercicio".
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight, Trophy } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { StrengthPr } from "@/domain/progress/models/Progress";
import { TONE_COLOR } from "../lib/metricVisual";
import { formatNumber } from "../lib/format";

export function StrengthCard({
  pr,
  onPress,
}: {
  pr: StrengthPr;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const tone = TONE_COLOR.lava;

  const setLine =
    pr.reps != null
      ? `${formatNumber(pr.bestWeightKg, 1)} kg × ${pr.reps}`
      : `${formatNumber(pr.bestWeightKg, 1)} kg`;

  const deltaChip =
    pr.deltaKg != null && pr.deltaKg !== 0
      ? `${pr.deltaKg > 0 ? "+" : "−"}${formatNumber(Math.abs(pr.deltaKg), 1)} kg`
      : null;

  const body = (
    <GlassSurface radius={18} style={{ padding: 15, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconBubble bg={tone.tint} size={36}>
          <Trophy size={18} color={tone.ink} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}>
            {t("progress.resumen.strengthLabel")}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.6, color: glass.ink3 }}>
            {t("progress.resumen.strengthCaption")}
          </Text>
        </View>
        {onPress != null && <ChevronRight size={18} color={glass.ink3} strokeWidth={2} />}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: sans(700), fontSize: 22, letterSpacing: -0.6, color: glass.white }}>
          {pr.exerciseName}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text style={{ fontFamily: sans(700), fontSize: 16, color: tone.ink }}>{setLine}</Text>
          {deltaChip && <Chip tone="up" label={deltaChip} />}
        </View>
      </View>
    </GlassSurface>
  );

  if (onPress == null) return body;

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
