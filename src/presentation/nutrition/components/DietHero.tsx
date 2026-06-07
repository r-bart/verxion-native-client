/**
 * DietHero — the centerpiece of the Plan segment: the active diet as a tappable
 * glass card. Eyebrow ("DIETA ACTIVA") + "por verxion" + chevron, name, chips
 * (goal · N comidas · X g proteína), divider, then the DietWeekBar. Tapping opens
 * the diet detail. Nutrition mirror of Entreno's `RoutineHero`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, Target, Utensils, Beef } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Chip } from "@/presentation/_shared/components/Chip";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { goalLabel } from "../lib/labels";
import { DietWeekBar } from "./DietWeekBar";
import type { ActiveDietSummary } from "@/domain/nutrition/models/NutritionDashboard";

export function DietHero({ diet }: { diet: ActiveDietSummary }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/nutrition/dieta/${diet.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={24} style={{ padding: 18, gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10,
              letterSpacing: 1.2,
              color: glass.lava,
              textTransform: "uppercase",
            }}
          >
            {t("nutrition.plan.activeEyebrow")}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Isotype size={13} glow />
            <Text
              style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}
            >
              {t("nutrition.plan.byVerxion")}
            </Text>
            <ChevronRight
              size={14}
              color="rgba(255,255,255,0.3)"
              strokeWidth={2}
            />
          </View>
        </View>

        <Text
          style={{
            fontFamily: sans(700),
            fontSize: 25,
            color: glass.white,
            letterSpacing: -0.75,
          }}
        >
          {diet.name}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {diet.goal && (
            <Chip
              tone="lava"
              icon={<Target size={12} color={glass.lava} strokeWidth={2.2} />}
              label={goalLabel(diet.goal, t)}
            />
          )}
          <Chip
            tone="neutral"
            icon={
              <Utensils
                size={12}
                color={palette.neutral.text}
                strokeWidth={2.2}
              />
            }
            label={t("nutrition.plan.mealsChip", { count: diet.mealCount })}
          />
          <Chip
            tone="lava"
            icon={<Beef size={12} color={glass.lava} strokeWidth={2.2} />}
            label={t("nutrition.plan.proteinChip", {
              grams: nInt(diet.targets.protein),
            })}
          />
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: glass.stroke,
            marginVertical: 2,
          }}
        />

        <DietWeekBar diet={diet} />
      </GlassSurface>
    </Pressable>
  );
}
