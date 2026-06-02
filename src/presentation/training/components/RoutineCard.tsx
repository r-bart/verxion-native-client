import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { Routine } from "@/domain/training/models/Routine";

interface RoutineCardProps {
  routine: Routine;
  onPress: () => void;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: PROGRESS_COLORS.tertiaryText + "20" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
          {current} / {total} sessions
        </Text>
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
          {Math.round(percentage)}%
        </Text>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: PROGRESS_COLORS.tertiaryText + "30" }}>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            width: `${percentage}%`,
            backgroundColor: PROGRESS_COLORS.positive.primary,
          }}
        />
      </View>
    </View>
  );
}

function getDurationType(routine: Routine): "fixed_sessions" | "date_range" | "indefinite" {
  if (routine.maxSessions) return "fixed_sessions";
  if (routine.startDate && routine.endDate) return "date_range";
  return "indefinite";
}

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const durationType = getDurationType(routine);
  const hasProgress = durationType === "fixed_sessions" && routine.maxSessions;

  const statusDotColor =
    routine.status === "active" ? "#34D399" :
    routine.status === "completed" ? "#60A5FA" :
    PROGRESS_COLORS.tertiaryText;

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
            }}
            numberOfLines={2}
          >
            {routine.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: statusDotColor,
            }}
          />
          <ChevronRight size={20} color={PROGRESS_COLORS.tertiaryText} />
        </View>
      </View>

      {routine.description && (
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            marginTop: 10,
          }}
          numberOfLines={2}
        >
          {routine.description}
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
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
          {routine.sessionsCompleted} {routine.sessionsCompleted === 1 ? "session" : "sessions"} completed
        </Text>

        {durationType === "indefinite" && (
          <>
            <View style={{ width: 1, height: 14, backgroundColor: PROGRESS_COLORS.tertiaryText + "40" }} />
            <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
              Ongoing
            </Text>
          </>
        )}
      </View>

      {hasProgress && (
        <ProgressBar current={routine.sessionsCompleted} total={routine.maxSessions!} />
      )}

      {routine.goal && (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: hasProgress ? 10 : 14,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: PROGRESS_COLORS.positive.background,
          }}
        >
          <Text style={{ fontSize: 12, color: PROGRESS_COLORS.positive.primary, fontWeight: "600", textTransform: "capitalize" }}>
            {routine.goal.replace(/_/g, " ")}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
