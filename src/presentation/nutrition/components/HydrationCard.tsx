/**
 * HydrationCard — today's water against the goal: a droplet bubble, the value /
 * goal in litres, and a row of cups that fill (cyan) as the day progresses.
 * Mirrors the handoff's `HydrationCard`. Read-only (logging lives elsewhere).
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Droplet } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nL } from "../lib/format";
import type { WaterAmount } from "@/domain/nutrition/models/NutritionDashboard";

const CUPS = 8;

export function HydrationCard({
  water,
  goal,
}: {
  water: WaterAmount;
  goal: WaterAmount;
}) {
  const { t } = useTranslation();
  const frac = goal.value > 0 ? Math.min(1, water.value / goal.value) : 0;
  const doneCups = Math.round(frac * CUPS);

  return (
    <GlassSurface
      radius={16}
      style={{
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <IconBubble bg={palette.body.background} size={40}>
        <Droplet size={19} color={palette.body.text} strokeWidth={2} />
      </IconBubble>
      <View style={{ flex: 1, gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
          >
            {t("nutrition.hydration.title")}
          </Text>
          <Text
            style={{ fontFamily: mono(600), fontSize: 12.5, color: glass.ink2 }}
          >
            {nL(water.value)}{" "}
            <Text style={{ color: glass.ink3 }}>/ {nL(goal.value)} L</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {Array.from({ length: CUPS }).map((_, i) => (
            <View
              key={`cup-${i}`}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 9999,
                backgroundColor:
                  i < doneCups ? palette.body.text : "rgba(255,255,255,0.10)",
              }}
            />
          ))}
        </View>
      </View>
    </GlassSurface>
  );
}
