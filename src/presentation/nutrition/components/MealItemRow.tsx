/**
 * MealItemRow — one food in the meal's item list: name + portion amount, plus the
 * agent's alternatives as a read-only "swap" line. The read-model gives no per-item
 * id or macros, so the row is static (no tap-through to food detail) and shows only
 * name/amount/alternatives — exactly what the API returns.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Repeat } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { MealDetailItem } from "@/domain/nutrition/models/MealDetail";

export function MealItemRow({ item }: { item: MealDetailItem }) {
  const { t } = useTranslation();
  return (
    <GlassSurface radius={16} style={{ padding: 13, gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Text
          style={{ flex: 1, fontFamily: sans(600), fontSize: 14, color: glass.white }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink2 }}>
          {item.amount}
        </Text>
      </View>

      {item.alternatives.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Repeat size={11} color={glass.ink3} strokeWidth={2.2} />
          <Text
            style={{ flex: 1, fontFamily: mono(400), fontSize: 11.5, color: glass.ink3 }}
            numberOfLines={2}
          >
            {t("nutrition.mealDetail.alternatives", {
              alts: item.alternatives.join(" · "),
            })}
          </Text>
        </View>
      )}
    </GlassSurface>
  );
}
