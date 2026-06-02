import { View, Text, Pressable } from "react-native";
import { Clock, ChevronRight, Layers } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { SessionListItem as SessionListItemType } from "@/domain/sessions/models/Session";

interface SessionListItemProps {
  session: SessionListItemType;
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}t`;
  return `${Math.round(vol)}kg`;
}

function formatCompletionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function SessionListItemCard({ session, onPress }: SessionListItemProps) {
  const subtitle = session.routineName
    ? `${session.routineName}${session.workoutDayName ? ` · ${session.workoutDayName}` : ""}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${session.name}, ${formatDate(session.date)}`}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardTitle,
              fontSize: 16,
              color: PROGRESS_COLORS.primaryText,
              marginBottom: subtitle ? 2 : 6,
            }}
            numberOfLines={2}
          >
            {session.name}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 12,
                color: PROGRESS_COLORS.tertiaryText,
                marginBottom: 6,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {session.completionRate < 1 && (
              <View
                style={{
                  backgroundColor: PROGRESS_COLORS.neutral.primary,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#000" }}>
                  {formatCompletionRate(session.completionRate)}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
              {formatDate(session.date)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={PROGRESS_COLORS.tertiaryText} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: PROGRESS_COLORS.tertiaryText + "20",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Clock size={14} color={PROGRESS_COLORS.secondaryText} />
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
            {formatDuration(session.durationSeconds)}
          </Text>
        </View>

        <View style={{ width: 1, height: 14, backgroundColor: PROGRESS_COLORS.tertiaryText + "40" }} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Layers size={14} color={PROGRESS_COLORS.secondaryText} />
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
            {session.totalSets} sets
          </Text>
        </View>

        <View style={{ width: 1, height: 14, backgroundColor: PROGRESS_COLORS.tertiaryText + "40" }} />

        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
          {formatVolume(session.totalVolume)}
        </Text>
      </View>
    </Pressable>
  );
}
