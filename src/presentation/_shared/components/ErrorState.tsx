import { View, Text, Pressable } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "../constants/progress-colors";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center" style={{ paddingVertical: 48, paddingHorizontal: 24 }}>
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          backgroundColor: PROGRESS_COLORS.health.background,
          marginBottom: 16,
        }}
      >
        <AlertCircle size={28} color={PROGRESS_COLORS.health.primary} />
      </View>
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.cardTitle,
          color: PROGRESS_COLORS.primaryText,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.cardSubtitle,
          color: PROGRESS_COLORS.secondaryText,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {message || "An error occurred"}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="active:opacity-80"
          style={{
            borderRadius: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: PROGRESS_COLORS.cardBackground,
            borderWidth: 1,
            borderColor: PROGRESS_COLORS.tertiaryText + "40",
          }}
        >
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              fontWeight: "600",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            Retry
          </Text>
        </Pressable>
      )}
    </View>
  );
}
