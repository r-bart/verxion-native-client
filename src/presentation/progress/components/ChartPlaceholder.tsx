import { View, Text } from "react-native";

interface ChartPlaceholderProps {
  label?: string;
  height?: number;
}

export function ChartPlaceholder({ label = "Chart", height = 180 }: ChartPlaceholderProps) {
  return (
    <View
      className="border border-dashed border-muted-foreground/30 rounded-xl items-center justify-center"
      style={{ height }}
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-xs text-muted-foreground/60 mt-1">Victory Native chart</Text>
    </View>
  );
}
