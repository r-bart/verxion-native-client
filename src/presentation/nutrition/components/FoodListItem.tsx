import { View, Text, Pressable } from "react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import type { Food } from "@/domain/nutrition/models/Food";

interface FoodListItemProps {
  food: Food;
  onPress?: () => void;
}

export function FoodListItem({ food, onPress }: FoodListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}
            numberOfLines={2}
          >
            {food.name}
          </Text>
          {food.brand && (
            <Text style={{ fontSize: 12, color: PROGRESS_COLORS.tertiaryText, marginTop: 2 }}>
              {food.brand}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
          {Math.round(food.caloriesPer100)} kcal
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: PROGRESS_COLORS.tertiaryText, marginTop: 6 }}>
        {food.proteinPer100.toFixed(0)}P · {food.carbsPer100.toFixed(0)}C · {food.fatPer100.toFixed(0)}F per 100g
      </Text>
      {food.isCustom && (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: "#064e3b50",
            borderWidth: 1,
            borderColor: "#34D39950",
          }}
        >
          <Text style={{ fontSize: 10, color: "#34D399", fontWeight: "600" }}>Custom</Text>
        </View>
      )}
    </Pressable>
  );
}
