import { View, Text } from "react-native";
import { UtensilsCrossed, Droplets } from "lucide-react-native";
import { useNutritionDayState } from "../hooks/useNutritionDayState";
import { useDailyWater } from "../hooks/useDailyWater";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { MacroProgress } from "@/domain/nutrition/models/NutritionDayState";

const WATER_GOAL = 2500;

const MACRO_CONFIG = [
  { key: "calories" as const, label: "Calories", color: PROGRESS_COLORS.neutral.primary },
  { key: "protein" as const, label: "Protein", color: PROGRESS_COLORS.health.primary },
  { key: "carbs" as const, label: "Carbs", color: PROGRESS_COLORS.positive.primary },
  { key: "fat" as const, label: "Fat", color: PROGRESS_COLORS.neutral.secondary },
] as const;

function MacroRow({ label, macro, color }: { label: string; macro: MacroProgress; color: string }) {
  const pct = macro.target > 0 ? Math.min((macro.actual / macro.target) * 100, 100) : 0;
  const isCalories = macro.unit === "kcal";
  const display = isCalories
    ? `${Math.round(macro.actual)} / ${Math.round(macro.target)}`
    : `${Math.round(macro.actual)} / ${Math.round(macro.target)}${macro.unit}`;

  return (
    <View style={{ gap: 6 }}>
      <View className="flex-row items-center justify-between">
        <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.primaryText }}>
          {label}
        </Text>
        <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
          {display}
        </Text>
      </View>
      <View
        className="rounded-full"
        style={{ height: 6, backgroundColor: PROGRESS_COLORS.secondaryText + "30" }}
      >
        <View
          className="rounded-full"
          style={{ height: 6, width: `${pct}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export function NutritionDayCard() {
  const { data, isLoading } = useNutritionDayState();
  const { data: waterData, isLoading: waterLoading } = useDailyWater();

  if (isLoading || waterLoading) {
    return (
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </View>
    );
  }

  if (!data) return null;

  const complianceColor =
    data.compliance >= 80
      ? PROGRESS_COLORS.positive.primary
      : data.compliance >= 50
        ? PROGRESS_COLORS.neutral.primary
        : PROGRESS_COLORS.health.primary;

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
      <View
        className="rounded-2xl border border-border"
        style={{ backgroundColor: PROGRESS_COLORS.cardBackground, padding: 24 }}
      >
        <View className="flex-row items-center justify-between" style={{ marginBottom: 16 }}>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 40, height: 40, backgroundColor: PROGRESS_COLORS.neutral.background }}
            >
              <UtensilsCrossed size={20} color={PROGRESS_COLORS.neutral.primary} />
            </View>
            <View>
              <Text style={{ ...METRIC_TYPOGRAPHY.metricLabel, fontWeight: "700", color: PROGRESS_COLORS.primaryText }}>
                Nutrition
              </Text>
              <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
                {data.mealsLogged} meal{data.mealsLogged !== 1 ? "s" : ""} logged
              </Text>
            </View>
          </View>
          <View
            className="rounded-full items-center justify-center"
            style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: complianceColor + "20" }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: complianceColor }}>
              {Math.round(data.compliance)}%
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {MACRO_CONFIG.map(({ key, label, color }) => (
            <MacroRow key={key} label={label} macro={data[key]} color={color} />
          ))}
        </View>

        {waterData && (
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: PROGRESS_COLORS.secondaryText + "20",
            }}
          >
            <MacroRow
              label="Water"
              macro={{
                actual: waterData.totalMl,
                target: WATER_GOAL,
                unit: "ml",
              }}
              color={PROGRESS_COLORS.body.primary}
            />
          </View>
        )}
      </View>
    </View>
  );
}
