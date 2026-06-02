import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useWorkoutDaySessionHistory } from "../hooks/useWorkoutDaySessionHistory";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
} from "@/presentation/_shared/constants/progress-colors";

interface SessionHistorySectionProps {
  workoutDayId: string;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toLocaleString()}kg`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function getDeltaPercent(
  current: number,
  previous: number | undefined
): number | null {
  if (previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function SessionHistorySection({ workoutDayId }: SessionHistorySectionProps) {
  const router = useRouter();
  const { data: sessions, isLoading, isError } = useWorkoutDaySessionHistory(workoutDayId);

  if (isLoading || isError) return null;

  const list = sessions ?? [];
  const maxVolume = Math.max(...list.map((s) => s.totalVolume), 1);

  return (
    <View>
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.cardTitle,
          color: PROGRESS_COLORS.primaryText,
          marginBottom: 12,
        }}
      >
        Session History
        {list.length > 0 && (
          <Text style={{ color: PROGRESS_COLORS.secondaryText, fontSize: 15, fontWeight: "400" }}>
            {`  ${list.length}`}
          </Text>
        )}
      </Text>

      {list.length === 0 ? (
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.tertiaryText, textAlign: "center", paddingVertical: 20 }}>
          No sessions recorded yet
        </Text>
      ) : (
        <View
          style={{
            backgroundColor: PROGRESS_COLORS.cardBackground,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: PROGRESS_COLORS.tertiaryText + "20",
            overflow: "hidden",
          }}
        >
          {list.map((session, index) => {
            const delta = getDeltaPercent(
              session.totalVolume,
              index < list.length - 1 ? list[index + 1].totalVolume : undefined
            );
            const barWidth = (session.totalVolume / maxVolume) * 100;
            const barOpacity = 1 - (index / list.length) * 0.6;

            return (
              <Pressable
                key={session.id}
                onPress={() => router.push(`/training/session/${session.id}`)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  height: 44,
                  paddingHorizontal: 14,
                  opacity: pressed ? 0.7 : 1,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: PROGRESS_COLORS.tertiaryText + "20",
                })}
              >
                {/* Date */}
                <Text
                  style={{
                    fontSize: 12,
                    color: PROGRESS_COLORS.secondaryText,
                    width: 44,
                  }}
                >
                  {formatDate(session.date)}
                </Text>

                {/* Volume bar */}
                <View style={{ flex: 1, height: 18, marginHorizontal: 10, justifyContent: "center" }}>
                  <View
                    style={{
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: PROGRESS_COLORS.positive.primary,
                      opacity: barOpacity,
                      width: `${Math.max(barWidth, 2)}%`,
                    }}
                  />
                </View>

                {/* Volume text */}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: PROGRESS_COLORS.primaryText,
                    width: 54,
                    textAlign: "right",
                  }}
                >
                  {formatVolume(session.totalVolume)}
                </Text>

                {/* Delta badge */}
                <View style={{ width: 50, alignItems: "flex-end" }}>
                  {delta !== null ? (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: delta >= 0 ? PROGRESS_COLORS.positive.primary : "#F87171",
                      }}
                    >
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(0)}%
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: PROGRESS_COLORS.tertiaryText,
                      }}
                    >
                      —
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
