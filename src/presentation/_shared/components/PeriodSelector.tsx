import { View, Text, Pressable } from "react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "../constants/progress-colors";

interface PeriodSelectorProps {
  periods: string[];
  selected: string;
  onSelect: (period: string) => void;
}

export function PeriodSelector({ periods, selected, onSelect }: PeriodSelectorProps) {
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {periods.map((p) => {
        const isSelected = p === selected;
        return (
          <Pressable
            key={p}
            onPress={() => onSelect(p)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: isSelected
                ? PROGRESS_COLORS.positive.primary
                : PROGRESS_COLORS.cardBackground,
              borderWidth: isSelected ? 0 : 1,
              borderColor: PROGRESS_COLORS.tertiaryText,
            }}
          >
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.context,
                fontWeight: "600",
                color: isSelected ? "#000000" : PROGRESS_COLORS.secondaryText,
              }}
            >
              {p}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
