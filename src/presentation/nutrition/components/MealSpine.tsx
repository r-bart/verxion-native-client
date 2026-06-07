/**
 * MealSpine — the day's meals as a read-only chronological spine, ordered by
 * `orderIndex`. Each row: a status node (done = check, now = lit icon + "ahora"
 * badge, up = dimmed icon), the meal-type icon, the name, and the plan's macro
 * targets (kcal · P/C/G). Tapping opens the meal detail. The dashboard read-model
 * carries no clock time or swap, so neither is rendered here (they live in the
 * meal detail). Mirrors the handoff's `MealSpine` (meals only).
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Check } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { mealTypeVisual } from "../lib/mealType";
import type { MealSpineItem } from "@/domain/nutrition/models/NutritionDashboard";

function MealRow({ meal, planId }: { meal: MealSpineItem; planId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const visual = mealTypeVisual(meal.mealType);
  const done = meal.status === "done";
  const now = meal.status === "now";
  const nodeColor = done || now ? glass.lava : glass.ink3;

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/nutrition/comida/${meal.mealId}?planId=${planId}` as Href
        )
      }
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: meal.status === "up" ? 0.7 : 1,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {done ? (
            <Check size={16} color={nodeColor} strokeWidth={2.6} />
          ) : (
            <visual.Icon size={16} color={nodeColor} strokeWidth={2} />
          )}
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{
                fontFamily: sans(600),
                fontSize: 14,
                color: glass.white,
              }}
            >
              {meal.name}
            </Text>
            {now && (
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
                    fontFamily: mono(600),
                    fontSize: 9,
                    letterSpacing: 0.5,
                    color: glass.lava,
                    textTransform: "uppercase",
                  }}
                >
                  {t("nutrition.plan.now")}
                </Text>
              </View>
            )}
          </View>
          {/* Per-meal targets come from the plan's meal rows; when the diet
              carries none (all-zero) we drop the macro line rather than render a
              row of zeros that reads as broken. The name + status still stand on
              their own. */}
          {meal.targets.kcal > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  fontFamily: mono(600),
                  fontSize: 11.5,
                  color: glass.ink2,
                }}
              >
                {nInt(meal.targets.kcal)} kcal
              </Text>
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 11,
                  color: glass.lava,
                }}
              >
                {nInt(meal.targets.protein)} P
              </Text>
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 11,
                  color: palette.body.text,
                }}
              >
                {nInt(meal.targets.carbs)} C
              </Text>
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 11,
                  color: palette.neutral.text,
                }}
              >
                {nInt(meal.targets.fat)} G
              </Text>
            </View>
          )}
        </View>
      </GlassSurface>
    </Pressable>
  );
}

export function MealSpine({
  meals,
  planId,
}: {
  meals: MealSpineItem[];
  planId: string;
}) {
  const { t } = useTranslation();
  if (meals.length === 0) return null;

  const ordered = [...meals].sort((a, b) => a.orderIndex - b.orderIndex);

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
        {t("nutrition.plan.daySpine")}
      </Text>
      <View style={{ gap: 8 }}>
        {ordered.map((m) => (
          <MealRow key={m.mealId} meal={m} planId={planId} />
        ))}
      </View>
    </View>
  );
}
