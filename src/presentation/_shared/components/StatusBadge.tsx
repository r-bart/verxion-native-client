import { View, Text } from "react-native";
import { PROGRESS_COLORS } from "../constants/progress-colors";

type Status = "active" | "inactive" | "completed" | "paused" | "draft" | "ready" | "cancelled" | "pending" | "in_progress";

const STATUS_CONFIG: Record<Status, { dot: string; label: string }> = {
  active: { dot: "#34D399", label: "Active" },
  in_progress: { dot: "#34D399", label: "In Progress" },
  inactive: { dot: PROGRESS_COLORS.tertiaryText, label: "Inactive" },
  completed: { dot: "#60A5FA", label: "Completed" },
  paused: { dot: "#FBBF24", label: "Paused" },
  draft: { dot: PROGRESS_COLORS.tertiaryText, label: "Draft" },
  ready: { dot: "#60A5FA", label: "Ready" },
  cancelled: { dot: PROGRESS_COLORS.health.primary, label: "Cancelled" },
  pending: { dot: "#FBBF24", label: "Pending" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status] ?? {
    dot: PROGRESS_COLORS.tertiaryText,
    label: status,
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "40",
      }}
    >
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: config.dot,
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: PROGRESS_COLORS.primaryText,
          textTransform: "capitalize",
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
