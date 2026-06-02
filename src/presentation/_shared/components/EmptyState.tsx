import { View, Text } from "react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "../constants/progress-colors";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      {icon && (
        <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
      )}
      {title && (
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardTitle,
            color: PROGRESS_COLORS.primaryText,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      )}
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.cardSubtitle,
          color: PROGRESS_COLORS.secondaryText,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
