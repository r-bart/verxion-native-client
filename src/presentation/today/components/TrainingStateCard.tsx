import { View, Text } from "react-native";
import { useDayState } from "../hooks/useDayState";
import { useExecutionScore } from "../hooks/useExecutionScore";
import { useSuggestedNextWorkout } from "../hooks/useSuggestedNextWorkout";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";
import {
  Dumbbell,
  BedDouble,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
} from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const stateConfig: Record<
  string,
  { label: string; description: string; icon: any; color: string; bgColor: string }
> = {
  NO_ENGAGEMENT_ACTIVE: {
    label: "No Active Plan",
    description: "Set up a routine to get started",
    icon: Calendar,
    color: PROGRESS_COLORS.secondaryText,
    bgColor: PROGRESS_COLORS.cardBackground,
  },
  REST_DAY: {
    label: "Rest Day",
    description: "Recovery is part of the process",
    icon: BedDouble,
    color: PROGRESS_COLORS.body.primary,
    bgColor: PROGRESS_COLORS.body.background,
  },
  WORKOUT_PLANNED: {
    label: "Workout Planned",
    description: "Ready to go!",
    icon: Dumbbell,
    color: PROGRESS_COLORS.positive.primary,
    bgColor: PROGRESS_COLORS.positive.background,
  },
  SESSION_IN_PROGRESS: {
    label: "Session In Progress",
    description: "Keep pushing!",
    icon: Play,
    color: PROGRESS_COLORS.positive.primary,
    bgColor: PROGRESS_COLORS.positive.background,
  },
  SESSION_COMPLETED: {
    label: "Session Completed",
    description: "Great work today!",
    icon: CheckCircle2,
    color: PROGRESS_COLORS.positive.primary,
    bgColor: PROGRESS_COLORS.positive.background,
  },
  MISSED_WORKOUT: {
    label: "Missed Workout",
    description: "There is always tomorrow",
    icon: AlertCircle,
    color: PROGRESS_COLORS.health.primary,
    bgColor: PROGRESS_COLORS.health.background,
  },
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? PROGRESS_COLORS.positive.primary
      : score >= 5
        ? PROGRESS_COLORS.neutral.primary
        : PROGRESS_COLORS.health.primary;

  return (
    <View
      className="rounded-full items-center justify-center"
      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: color + "20" }}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color }}>
        {score.toFixed(1)}
      </Text>
    </View>
  );
}

export function TrainingStateCard() {
  const { data, isLoading } = useDayState();
  const { data: scoreData } = useExecutionScore();
  const { data: nextWorkout } = useSuggestedNextWorkout();

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </View>
    );
  }

  if (!data) return null;

  const config = stateConfig[data.state] ?? stateConfig.NO_ENGAGEMENT_ACTIVE;
  const Icon = config.icon;
  const showScore = data.state === "SESSION_COMPLETED" && scoreData?.executionScore != null;
  const showNextWorkout =
    nextWorkout?.workoutDay != null &&
    (data.state === "SESSION_COMPLETED" || data.state === "REST_DAY" || data.state === "MISSED_WORKOUT");

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
      <View
        className="rounded-2xl border border-border"
        style={{
          backgroundColor: PROGRESS_COLORS.cardBackground,
          padding: 24,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1" style={{ gap: 16 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 48, height: 48, backgroundColor: config.bgColor }}
            >
              <Icon size={24} color={config.color} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.metricLabel,
                  fontWeight: "700",
                  color: config.color,
                }}
              >
                {config.label}
              </Text>
              {data.plannedWorkoutDay && (
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    color: PROGRESS_COLORS.primaryText,
                    marginTop: 2,
                  }}
                >
                  {data.plannedWorkoutDay.name}
                </Text>
              )}
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.context,
                  color: PROGRESS_COLORS.secondaryText,
                  marginTop: 4,
                }}
              >
                {config.description}
              </Text>
            </View>
          </View>
          {showScore && <ScoreBadge score={scoreData.executionScore!} />}
        </View>

        <View
          className="flex-row"
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: PROGRESS_COLORS.secondaryText + "20",
            gap: 24,
          }}
        >
          <View>
            <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
              Today
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginTop: 2 }}>
              {data.sessionsToday}{" "}
              <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
                session{data.sessionsToday !== 1 ? "s" : ""}
              </Text>
            </Text>
          </View>
          <View>
            <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
              This week
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginTop: 2 }}>
              {data.weekSessions}
              <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
                /{data.weekTarget}
              </Text>
            </Text>
          </View>
        </View>

        {showNextWorkout && (
          <View
            className="flex-row items-center"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: PROGRESS_COLORS.secondaryText + "20",
              gap: 8,
            }}
          >
            <ArrowRight size={14} color={PROGRESS_COLORS.secondaryText} />
            <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
              Next up:{" "}
            </Text>
            <Text style={{ ...METRIC_TYPOGRAPHY.context, fontWeight: "600", color: PROGRESS_COLORS.primaryText }}>
              {nextWorkout.workoutDay!.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
