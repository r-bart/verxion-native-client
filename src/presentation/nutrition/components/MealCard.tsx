import { View, Text } from "react-native";
import { UtensilsCrossed } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { Meal } from "@/domain/nutrition/models/MealLog";

interface MealCardProps {
  meal: Meal;
}

function formatMealType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <View
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: PROGRESS_COLORS.health.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UtensilsCrossed size={16} color={PROGRESS_COLORS.health.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: PROGRESS_COLORS.primaryText }}>
            {meal.name || formatMealType(meal.mealType)}
          </Text>
          <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
            {meal.items.length} items · {Math.round(meal.totalCalories)} kcal
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
            {Math.round(meal.totalProtein)}P · {Math.round(meal.totalCarbs)}C · {Math.round(meal.totalFat)}F
          </Text>
        </View>
      </View>

      {/* Items */}
      {meal.items.map((item) => (
        <View
          key={item.id}
          style={{
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: PROGRESS_COLORS.tertiaryText + "15",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 14, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}
              numberOfLines={1}
            >
              {item.foodName}
            </Text>
            <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>
              {item.quantity}{item.unit} · {Math.round(item.calories)} kcal
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: PROGRESS_COLORS.secondaryText }}>
            {Math.round(item.protein)}P · {Math.round(item.carbs)}C · {Math.round(item.fat)}F
          </Text>
        </View>
      ))}
    </View>
  );
}
