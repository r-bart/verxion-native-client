import { View, Text } from "react-native";

interface RefreshIndicatorProps {
  dataUpdatedAt: number;
}

export function RefreshIndicator({ dataUpdatedAt }: RefreshIndicatorProps) {
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

  return (
    <View className="items-center py-4">
      <Text className="text-xs text-muted-foreground">
        Updates every 10s
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        Last updated: {lastUpdated}
      </Text>
    </View>
  );
}
