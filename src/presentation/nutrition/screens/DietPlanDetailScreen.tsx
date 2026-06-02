import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Dumbbell, Coffee, Zap, CalendarDays } from "lucide-react-native";
import { StatusBadge } from "@/presentation/_shared/components/StatusBadge";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { useDietPlanDetail } from "../hooks/useDietPlanDetail";
import { MacroGrid } from "../components/MacroGrid";
import { NutritionSkeleton } from "../components/NutritionSkeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { DietPlanDay } from "@/domain/nutrition/models/DietPlan";

const DAY_TYPE_CONFIG: Record<string, { icon: typeof Dumbbell; color: string }> = {
  training: { icon: Dumbbell, color: "#34D399" },
  rest: { icon: Coffee, color: "#60A5FA" },
  refeed: { icon: Zap, color: "#FBBF24" },
  custom: { icon: CalendarDays, color: "#A78BFA" },
};

function DayRow({ day }: { day: DietPlanDay }) {
  const config = DAY_TYPE_CONFIG[day.dayType] ?? DAY_TYPE_CONFIG.custom;
  const Icon = config.icon;

  return (
    <View
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Icon size={16} color={config.color} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: PROGRESS_COLORS.primaryText }} numberOfLines={1}>
          {day.name}
        </Text>
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText, textTransform: "capitalize" }}>
          {day.dayType} · {day.mealCount} meals
        </Text>
      </View>
      {day.calories != null && (
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
          {Math.round(day.calories)} kcal
        </Text>
      )}
    </View>
  );
}

export function DietPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDietPlanDetail(id);
  const router = useRouter();

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <NutritionSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const { plan, days } = data;

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Title */}
        <View>
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 }}
          >
            <ChevronLeft size={20} color={PROGRESS_COLORS.health.primary} />
            <Text style={{ fontSize: 14, color: PROGRESS_COLORS.health.primary, fontWeight: "600" }}>
              Back
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 8,
            }}
          >
            {plan.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <StatusBadge status={plan.status} />
            {plan.goal && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: PROGRESS_COLORS.health.background,
                }}
              >
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.health.primary, fontWeight: "600", textTransform: "capitalize" }}>
                  {plan.goal.replace(/_/g, " ")}
                </Text>
              </View>
            )}
          </View>

          {plan.description && (
            <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.secondaryText, marginTop: 12 }}>
              {plan.description}
            </Text>
          )}
        </View>

        {/* Macro Grid */}
        <MacroGrid
          calories={plan.dailyCalories}
          protein={plan.dailyProtein}
          carbs={plan.dailyCarbs}
          fat={plan.dailyFat}
        />

        {/* Days */}
        {days.length > 0 && (
          <View>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardTitle,
                color: PROGRESS_COLORS.primaryText,
                marginBottom: 12,
              }}
            >
              Days ({days.length})
            </Text>
            <View style={{ gap: 8 }}>
              {days.map((day) => (
                <DayRow key={day.id} day={day} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
