/**
 * DietLibraryCard — the big diet card in "Dietas": a state eyebrow + meals meta,
 * the goal bubble with name and goal chip, then a foot that adapts to state (a
 * draft shows "ver plan"; an active/completed block shows the week cells, score
 * and the kcal/protein + adherence meta). Taps through to the diet detail.
 * Nutrition mirror of `RoutineLibraryCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import {
  Target,
  TrendingUp,
  Sparkles,
  Pause,
  ChevronRight,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { ScoreChip } from "@/presentation/_shared/components/ScoreChip";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { goalLabel } from "../lib/labels";
import { dietGoalVisual } from "../lib/dietGoalVisual";
import { DietWeekCells } from "./DietWeekCells";
import type {
  DietLibraryItem,
  DietLibraryState,
} from "@/domain/nutrition/models/DietLibrary";

const STATE_COLOR: Record<DietLibraryState, string> = {
  active: glass.lava,
  draft: palette.insight.text,
  paused: palette.neutral.text,
  completed: glass.up,
};

function StateEyebrow({ state }: { state: DietLibraryState }) {
  const { t } = useTranslation();
  const color = STATE_COLOR[state];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {state === "active" && (
        <View
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
        />
      )}
      {state === "draft" && <Sparkles size={11} color={color} strokeWidth={2.2} />}
      {state === "paused" && <Pause size={11} color={color} strokeWidth={2.2} />}
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 10,
          letterSpacing: 1,
          color,
          textTransform: "uppercase",
        }}
      >
        {t(`nutrition.dietas.stateEyebrow.${state}`)}
      </Text>
    </View>
  );
}

export function DietLibraryCard({ item }: { item: DietLibraryItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = dietGoalVisual(item.goal);
  const isDraft = item.state === "draft";
  const isCompleted = item.state === "completed";
  const hasWeeks = item.week != null && item.weeks != null;

  return (
    <Pressable
      onPress={() => router.push(`/nutrition/dieta/${item.id}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={t("nutrition.dietas.openDiet", { name: item.name })}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={20} style={{ padding: 16, gap: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <StateEyebrow state={item.state} />
          <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}>
            {t("nutrition.plan.mealsChip", { count: item.mealCount })}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <IconBubble bg={cfg.bg} size={46}>
            <cfg.Icon size={23} color={cfg.color} strokeWidth={2} />
          </IconBubble>
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                fontFamily: sans(700),
                fontSize: 18,
                color: glass.white,
                letterSpacing: -0.4,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.goal && (
              <View style={{ flexDirection: "row" }}>
                <Chip
                  tone="lava"
                  icon={<Target size={11} color={glass.lava} strokeWidth={2.2} />}
                  label={goalLabel(item.goal, t)}
                />
              </View>
            )}
          </View>
        </View>

        {isDraft ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}>
              {t("nutrition.dietas.kcalProtein", {
                kcal: nInt(item.targets.kcal),
                protein: nInt(item.proteinGoal),
              })}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 12.5,
                  color: STATE_COLOR.draft,
                }}
              >
                {t("nutrition.dietas.viewPlan")}
              </Text>
              <ChevronRight size={14} color={STATE_COLOR.draft} strokeWidth={2.2} />
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
                {isCompleted
                  ? t("nutrition.dietas.completedWeeks", { weeks: item.weeks ?? 0 })
                  : t("nutrition.plan.week", {
                      week: item.week ?? 1,
                      weeks: item.weeks ?? item.week ?? 1,
                    })}
              </Text>
              {!isCompleted && <ScoreChip state={item.scoreState} />}
            </View>

            {hasWeeks && (
              <DietWeekCells
                week={item.week as number}
                weeks={item.weeks as number}
                weekFraction={item.weekFraction}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
                numberOfLines={1}
              >
                {t("nutrition.dietas.kcalProtein", {
                  kcal: nInt(item.targets.kcal),
                  protein: nInt(item.proteinGoal),
                })}
              </Text>
              {item.adherence != null && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <TrendingUp size={11} color={glass.up} strokeWidth={2.2} />
                  <Text
                    style={{ fontFamily: mono(500), fontSize: 11, color: glass.up }}
                  >
                    {t("nutrition.dietas.adherence", {
                      pct: Math.round(item.adherence),
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
}
