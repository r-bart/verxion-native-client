import { View, Text } from "react-native";
import type { LiveSessionProgress } from "@/domain/sessions/models/Session";
import { Progress } from "@/presentation/_shared/components/ui/progress";

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  PERFECT_PLAN: "#4ADE80",
  PLAN_WITH_SUBSTITUTIONS: "#60A5FA",
  PLAN_PLUS_EXTRAS: "#FBBF24",
  PARTIAL_PLAN: "#FB923C",
  OFF_PLAN: "#F87171",
};

function formatClassification(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface SessionHeaderProps {
  data: LiveSessionProgress;
}

export function SessionHeader({ data }: SessionHeaderProps) {
  const { session, progress } = data;
  const completionPercent = Math.round(progress.completionRate * 100);
  const isPaused = session.status === "paused";
  const classification = progress.executionClassification;
  const classificationColor = classification
    ? CLASSIFICATION_COLORS[classification]
    : undefined;

  return (
    <View className="px-6 pt-4 pb-4">
      <Text className="text-xl font-bold text-foreground">
        {session.name}
      </Text>
      {(session.routineName || session.workoutDayName) && (
        <Text className="mt-0.5 text-sm text-muted-foreground">
          {[session.routineName, session.workoutDayName]
            .filter(Boolean)
            .join(" / ")}
        </Text>
      )}
      <View className="mt-3 flex-row items-center justify-between">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text className="text-3xl font-bold text-foreground tabular-nums">
            {formatElapsed(session.elapsedSeconds)}
          </Text>
          {isPaused && (
            <View
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600" }}>
                Paused
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-medium text-muted-foreground">
          {progress.completedExercises}/{progress.totalExercises} exercises
          {" \u00B7 "}
          {completionPercent}%
        </Text>
      </View>
      <Progress value={completionPercent} className="mt-2 h-2" />
      {classification && classificationColor && (
        <View style={{ marginTop: 8, flexDirection: "row" }}>
          <View
            style={{
              backgroundColor: `${classificationColor}15`,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: classificationColor,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {formatClassification(classification)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
