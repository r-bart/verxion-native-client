/**
 * SupplementsList — the day's supplements as a small read-only group. Each row:
 * a pill bubble (insight/purple), the name, its schedule label (free-form text
 * from the API, shown as-is — it is not a clock time), and a taken check. Kept
 * separate from the meal spine because the read-model gives supplements no time
 * to interleave by.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Pill, Check } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { supplementTimingLabel } from "../lib/labels";
import type { SupplementItem } from "@/domain/nutrition/models/NutritionDashboard";

export function SupplementsList({
  supplements,
}: {
  supplements: SupplementItem[];
}) {
  const { t } = useTranslation();
  if (supplements.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 11,
          letterSpacing: 1,
          color: glass.ink3,
          textTransform: "uppercase",
        }}
      >
        {t("nutrition.plan.supplements")}
      </Text>
      <View style={{ gap: 8 }}>
        {supplements.map((s) => (
          <GlassSurface
            key={s.id}
            radius={16}
            style={{
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <IconBubble bg={palette.insight.background} size={34}>
              <Pill size={16} color={palette.insight.text} strokeWidth={2} />
            </IconBubble>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 13.5,
                  color: glass.white,
                }}
              >
                {s.name}
              </Text>
              {s.schedule != null && (
                <Text
                  style={{
                    fontFamily: mono(500),
                    fontSize: 11,
                    color: glass.ink3,
                  }}
                >
                  {supplementTimingLabel(s.schedule, t)}
                </Text>
              )}
            </View>
            {s.taken && <Check size={16} color={glass.up} strokeWidth={2.6} />}
          </GlassSurface>
        ))}
      </View>
    </View>
  );
}
