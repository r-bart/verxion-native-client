/**
 * DietMealCard — a meal in the diet-detail day spine: the meal-type bubble, the
 * name (+ "principal" tag for the key meal), and the planned macros (kcal · P/C/G).
 * Taps through to the meal detail, carrying the plan id so the detail can resolve
 * `GET /nutrition/meal-detail/{planId}/{mealId}`. Read-only.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { mealTypeVisual } from "../lib/mealType";
import type { DietDetailMeal } from "@/domain/nutrition/models/DietDetail";

const MACRO_COLOR = {
  protein: glass.lava,
  carbs: palette.body.text,
  fat: palette.neutral.text,
} as const;

export function DietMealCard({
  planId,
  meal,
}: {
  planId: string;
  meal: DietDetailMeal;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const visual = mealTypeVisual(meal.mealType);

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/nutrition/comida/${meal.id}?planId=${planId}` as Href
        )
      }
      accessibilityRole="button"
      accessibilityLabel={t("nutrition.dietDetail.openMeal", { name: meal.name })}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}
      >
        <IconBubble bg={glass.lavaBg} size={40}>
          <visual.Icon size={20} color={glass.lava} strokeWidth={2} />
        </IconBubble>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Text
              style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
              numberOfLines={1}
            >
              {meal.name}
            </Text>
            {meal.isKey && (
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 9999,
                  backgroundColor: glass.lavaBg,
                  borderWidth: 1,
                  borderColor: glass.lavaBorder,
                }}
              >
                <Text
                  style={{
                    fontFamily: sans(700),
                    fontSize: 9,
                    letterSpacing: 0.3,
                    color: glass.lava,
                    textTransform: "uppercase",
                  }}
                >
                  {t("nutrition.dietDetail.keyMeal")}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}>
              {t("nutrition.dietDetail.kcal", { kcal: nInt(meal.macros.kcal) })}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink3 }}>
              ·
            </Text>
            <Text style={{ fontFamily: mono(600), fontSize: 11.5, color: MACRO_COLOR.protein }}>
              {nInt(meal.macros.protein)}P
            </Text>
            <Text style={{ fontFamily: mono(600), fontSize: 11.5, color: MACRO_COLOR.carbs }}>
              {nInt(meal.macros.carbs)}C
            </Text>
            <Text style={{ fontFamily: mono(600), fontSize: 11.5, color: MACRO_COLOR.fat }}>
              {nInt(meal.macros.fat)}G
            </Text>
          </View>
        </View>

        <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}
