import { View, Text } from "react-native";
import { Flame, Beef, Wheat, Droplets } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

interface MacroGridProps {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

function MacroCell({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 14,
        alignItems: "center",
        gap: 6,
      }}
    >
      <Icon size={20} color={color} />
      <Text style={{ fontSize: 11, color: PROGRESS_COLORS.secondaryText }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>{unit}</Text>
    </View>
  );
}

export function MacroGrid({ calories, protein, carbs, fat }: MacroGridProps) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <MacroCell
          icon={Flame}
          label="Calories"
          value={calories != null ? String(Math.round(calories)) : "--"}
          unit="kcal"
          color="#FF6B6B"
        />
        <MacroCell
          icon={Beef}
          label="Protein"
          value={protein != null ? protein.toFixed(0) : "--"}
          unit="g"
          color="#60A5FA"
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <MacroCell
          icon={Wheat}
          label="Carbs"
          value={carbs != null ? carbs.toFixed(0) : "--"}
          unit="g"
          color="#FBBF24"
        />
        <MacroCell
          icon={Droplets}
          label="Fat"
          value={fat != null ? fat.toFixed(0) : "--"}
          unit="g"
          color="#A78BFA"
        />
      </View>
    </View>
  );
}
