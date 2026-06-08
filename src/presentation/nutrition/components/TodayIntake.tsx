/**
 * TodayIntake — "where you're at today": the kcal MacroRing (consumed vs target,
 * subdivided by macro) with the remaining/over tag and meals-done count, the three
 * macro bars (consumed/target), and the next-meal CTA. Read-only — the CTA opens
 * the day's meal plan. Mirrors the handoff's `TodayIntake`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { MacroRing } from "@/presentation/_shared/components/MacroRing";
import { ProgressBar } from "@/presentation/_shared/components/ProgressBar";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import type {
  DietToday,
  ActiveDietSummary,
  NextMeal,
} from "@/domain/nutrition/models/NutritionDashboard";

type Props = {
  today: DietToday;
  diet: ActiveDietSummary;
  next: NextMeal | null;
};

export function TodayIntake({ today, diet, next }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { consumed } = today;
  const goal = diet.targets;
  const over = consumed.kcal > goal.kcal;
  const left = Math.max(0, goal.kcal - consumed.kcal);
  // Ring center reads the *relative* progress (% of goal); the absolute number
  // lives on the right. Not clamped — >100% is the honest read when over-eating
  // (the ring fill itself caps at 100%, so the % is what surfaces the overage).
  const pct = goal.kcal > 0 ? Math.round((consumed.kcal / goal.kcal) * 100) : 0;

  const macros = [
    {
      key: "protein",
      label: t("nutrition.macros.protein"),
      v: consumed.protein,
      target: goal.protein,
      color: glass.lava,
    },
    {
      key: "carbs",
      label: t("nutrition.macros.carbs"),
      v: consumed.carbs,
      target: goal.carbs,
      color: palette.body.text,
    },
    {
      key: "fat",
      label: t("nutrition.macros.fat"),
      v: consumed.fat,
      target: goal.fat,
      color: palette.neutral.text,
    },
  ];

  return (
    <GlassSurface
      radius={20}
      tintColor={glass.lavaBg}
      fallbackFill={glass.lavaBg}
      style={{
        padding: 16,
        gap: 16,
        borderColor: glass.lavaBorder,
        borderWidth: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <MacroRing
          size={92}
          stroke={9}
          consumed={consumed}
          goalKcal={goal.kcal}
        >
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 26,
              color: over ? palette.health.text : glass.white,
              letterSpacing: -0.7,
              fontVariant: ["tabular-nums"],
            }}
          >
            {pct}%
          </Text>
        </MacroRing>

        <View style={{ flex: 1, gap: 5 }}>
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10,
              letterSpacing: 1,
              color: glass.ink3,
              textTransform: "uppercase",
            }}
          >
            {t("nutrition.intake.consumedToday")}
          </Text>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 15,
              color: over ? palette.health.text : glass.up,
            }}
          >
            {over
              ? t("nutrition.intake.over", {
                  kcal: nInt(consumed.kcal - goal.kcal),
                })
              : t("nutrition.intake.remaining", { kcal: nInt(left) })}
          </Text>
          <Text
            style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink2 }}
          >
            {t("nutrition.intake.meals", {
              done: today.mealsLogged,
              total: today.mealsTotal,
            })}
          </Text>
        </View>
      </View>

      <View style={{ gap: 11 }}>
        {macros.map((m) => (
          <View key={m.key} style={{ gap: 5 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontFamily: mono(600),
                  fontSize: 11,
                  color: glass.ink2,
                }}
              >
                {m.label}
              </Text>
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 11,
                  color: glass.ink3,
                }}
              >
                {nInt(m.v)} / {nInt(m.target)} g
              </Text>
            </View>
            <ProgressBar
              value={m.target > 0 ? m.v / m.target : 0}
              color={m.color}
            />
          </View>
        ))}
      </View>

      {next && (
        <Pressable
          onPress={() => router.push("/nutrition/plan-comidas" as Href)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            opacity: pressed ? glass.pressOpacity : 1,
          })}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: glass.stroke,
            }}
          >
            {/* flex:1 column lets the meal line truncate instead of pushing the
                chevron off-screen on narrow devices. Label is "start with" when
                nothing's been eaten yet today (fresh), else "now". */}
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: mono(600),
                  fontSize: 10,
                  letterSpacing: 1,
                  color: glass.lava,
                  textTransform: "uppercase",
                }}
              >
                {t(
                  today.mealsLogged === 0
                    ? "nutrition.intake.startWith"
                    : "nutrition.intake.nowEat"
                )}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: sans(600),
                  fontSize: 13,
                  color: glass.white,
                }}
              >
                {next.name}
                {next.targets.kcal > 0 && (
                  <Text
                    style={{
                      fontFamily: mono(500),
                      fontSize: 11,
                      color: glass.ink3,
                    }}
                  >
                    {"  "}
                    {nInt(next.targets.kcal)} kcal ·{" "}
                    {nInt(next.targets.protein)} g P
                  </Text>
                )}
              </Text>
            </View>
            <ChevronRight
              size={18}
              color="rgba(255,255,255,0.35)"
              strokeWidth={2}
            />
          </View>
        </Pressable>
      )}
    </GlassSurface>
  );
}
