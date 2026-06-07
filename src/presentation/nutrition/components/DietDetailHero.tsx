/**
 * DietDetailHero — the "Detalle de dieta" header: state eyebrow + goal bubble +
 * name + goal chip, a stats grid (comidas · kcal/día · g proteína · L agua), then
 * the week progress (cells + score + "X días registrados · Y% adherencia"). Reads
 * only what the read-model returns; nullable week/score/adherence collapse cleanly.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Target,
  Utensils,
  Flame,
  Beef,
  Droplet,
  TrendingUp,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { ScoreChip } from "@/presentation/_shared/components/ScoreChip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt, nL } from "../lib/format";
import { goalLabel } from "../lib/labels";
import { dietGoalVisual } from "../lib/dietGoalVisual";
import { DietWeekCells } from "./DietWeekCells";
import type { DietDetail } from "@/domain/nutrition/models/DietDetail";

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
      {icon}
      <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white }}>
        {value}
      </Text>
      <Text style={{ fontFamily: mono(400), fontSize: 10, color: glass.ink3 }}>
        {label}
      </Text>
    </View>
  );
}

export function DietDetailHero({ diet }: { diet: DietDetail }) {
  const { t } = useTranslation();
  const cfg = dietGoalVisual(diet.goal);
  const isCompleted = diet.state === "completed";
  const hasWeeks = diet.week != null && diet.weeks != null;

  return (
    <GlassSurface radius={24} style={{ padding: 18, gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <IconBubble bg={cfg.bg} size={52}>
          <cfg.Icon size={26} color={cfg.color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 7 }}>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 22,
              color: glass.white,
              letterSpacing: -0.6,
            }}
            numberOfLines={2}
          >
            {diet.name}
          </Text>
          {diet.goal && (
            <View style={{ flexDirection: "row" }}>
              <Chip
                tone="lava"
                icon={<Target size={11} color={glass.lava} strokeWidth={2.2} />}
                label={goalLabel(diet.goal, t)}
              />
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingVertical: 14,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: glass.stroke,
        }}
      >
        <Stat
          icon={<Utensils size={15} color={glass.ink2} strokeWidth={2} />}
          value={String(diet.mealCount)}
          label={t("nutrition.dietDetail.statMeals")}
        />
        <Stat
          icon={<Flame size={15} color={glass.ink2} strokeWidth={2} />}
          value={nInt(diet.targets.kcal)}
          label={t("nutrition.dietDetail.statKcal")}
        />
        <Stat
          icon={<Beef size={15} color={glass.ink2} strokeWidth={2} />}
          value={nInt(diet.proteinGoal)}
          label={t("nutrition.dietDetail.statProtein")}
        />
        <Stat
          icon={<Droplet size={15} color={glass.ink2} strokeWidth={2} />}
          value={nL(diet.waterGoal.value)}
          label={t("nutrition.dietDetail.statWater")}
        />
      </View>

      {hasWeeks && (
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink2 }}>
              {isCompleted
                ? t("nutrition.dietas.completedWeeks", { weeks: diet.weeks ?? 0 })
                : t("nutrition.plan.week", {
                    week: diet.week ?? 1,
                    weeks: diet.weeks ?? diet.week ?? 1,
                  })}
            </Text>
            {!isCompleted && <ScoreChip state={diet.scoreState} />}
          </View>

          <DietWeekCells
            week={diet.week as number}
            weeks={diet.weeks as number}
            weekFraction={diet.weekFraction}
            height={6}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink3 }}>
              {t("nutrition.dietDetail.daysLogged", { count: diet.daysLogged })}
            </Text>
            {diet.adherence != null && (
              <>
                <Text
                  style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink3 }}
                >
                  ·
                </Text>
                <TrendingUp size={11} color={glass.up} strokeWidth={2.2} />
                <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.up }}>
                  {t("nutrition.dietas.adherence", { pct: Math.round(diet.adherence) })}
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    </GlassSurface>
  );
}
