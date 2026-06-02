import { View, Text, Pressable } from "react-native";
import { CalendarDays, Target, ChevronRight } from "lucide-react-native";
import { StatusBadge } from "@/presentation/_shared/components/StatusBadge";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { DietPlan } from "@/domain/nutrition/models/DietPlan";

interface DietPlanCardProps {
  plan: DietPlan;
  onPress: () => void;
}

export function DietPlanCard({ plan, onPress }: DietPlanCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardTitle,
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {plan.name}
          </Text>
          <StatusBadge status={plan.status} />
        </View>
        <ChevronRight size={20} color={PROGRESS_COLORS.tertiaryText} />
      </View>

      {plan.description && (
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            marginTop: 10,
          }}
          numberOfLines={2}
        >
          {plan.description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: PROGRESS_COLORS.tertiaryText + "20",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <CalendarDays size={14} color={PROGRESS_COLORS.secondaryText} />
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
            {plan.daysCount} days
          </Text>
        </View>

        {plan.dailyCalories != null && (
          <>
            <View style={{ width: 1, height: 14, backgroundColor: PROGRESS_COLORS.tertiaryText + "40" }} />
            <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
              {Math.round(plan.dailyCalories)} kcal
            </Text>
          </>
        )}

        {plan.dailyProtein != null && (
          <>
            <View style={{ width: 1, height: 14, backgroundColor: PROGRESS_COLORS.tertiaryText + "40" }} />
            <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
              {Math.round(plan.dailyProtein)}g P
            </Text>
          </>
        )}
      </View>

      {plan.goal && (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: 10,
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
    </Pressable>
  );
}
