import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { useSessionReport } from "../hooks/useSessionReport";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import {
  ChevronLeft,
  Dumbbell,
  Clock,
  Layers,
  Repeat,
  Trophy,
  Activity,
  Star,
  Target,
} from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}

function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}t`;
  return `${Math.round(vol)}kg`;
}

function formatClassificationLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  PERFECT_PLAN: "#10B981",
  PLAN_WITH_SUBSTITUTIONS: "#3B82F6",
  PLAN_PLUS_EXTRAS: "#F59E0B",
  PARTIAL_PLAN: "#F97316",
  OFF_PLAN: "#EF4444",
};

function getScoreColor(score: number): string {
  if (score >= 7) return "#10B981";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
}

function getSetTypeBadgeColor(setType: string): string {
  const upper = setType?.toUpperCase() ?? "";
  if (upper === "NORMAL" || upper === "STRAIGHT") return "#10B981";
  if (upper === "SUPERSET") return "#3B82F6";
  if (upper === "DROP_SET" || upper === "DROPSET") return "#F59E0B";
  if (upper === "GIANT_SET" || upper === "GIANTSET") return "#F97316";
  return "#8E8E93";
}

export function SessionReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSessionReport(id ?? "");

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ProgressSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <EmptyState message="Session report not found." />
      </SafeAreaView>
    );
  }

  const hasAssessment =
    data.effortScore != null || data.qualityScore != null || data.pump != null;

  const sortedMuscleGroups = [...(data.muscleGroupDistribution ?? [])]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <ChevronLeft size={24} color={PROGRESS_COLORS.primaryText} />
          </Pressable>
          <View className="flex-1">
            <Text style={{ fontSize: 22, fontWeight: "700", color: PROGRESS_COLORS.primaryText }}>
              {data.name || "Workout"}
            </Text>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
                marginTop: 2,
              }}
            >
              {data.date
                ? new Date(data.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unknown date"}
            </Text>
          </View>
        </View>

        {/* Execution Classification Badge */}
        {data.executionClassification && (
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View
              className="flex-row items-center rounded-full"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor:
                  (CLASSIFICATION_COLORS[data.executionClassification] ?? "#8E8E93") + "20",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: CLASSIFICATION_COLORS[data.executionClassification] ?? "#8E8E93",
                }}
              >
                {formatClassificationLabel(data.executionClassification)}
              </Text>
            </View>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
              }}
            >
              {Math.round(data.completionRate * 100)}% completed
            </Text>
          </View>
        )}

        {/* KPI Grid */}
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={formatVolume(data.totalVolume)}
              label="Volume"
              color="health"
              icon={<Dumbbell size={24} color={PROGRESS_COLORS.health.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={formatDuration(data.duration)}
              label="Duration"
              color="insight"
              icon={<Clock size={24} color={PROGRESS_COLORS.insight.primary} />}
            />
          </View>
        </View>
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={data.totalSets}
              label="Sets"
              color="positive"
              icon={<Layers size={24} color={PROGRESS_COLORS.positive.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.totalReps}
              label="Reps"
              color="neutral"
              icon={<Repeat size={24} color={PROGRESS_COLORS.neutral.primary} />}
            />
          </View>
        </View>
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={data.peakWeight}
              label="Peak Weight (kg)"
              color="health"
              icon={<Trophy size={24} color={PROGRESS_COLORS.health.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.averageRir != null ? data.averageRir.toFixed(1) : "--"}
              label="Avg RIR"
              color="body"
              icon={<Target size={24} color={PROGRESS_COLORS.body.primary} />}
            />
          </View>
        </View>

        {/* Workout Assessment */}
        {hasAssessment && (
          <View>
            <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
              <Star size={18} color={PROGRESS_COLORS.primaryText} />
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardTitle,
                  color: PROGRESS_COLORS.primaryText,
                }}
              >
                Workout Assessment
              </Text>
            </View>
            <View className="flex-row" style={{ gap: 10 }}>
              {[
                { label: "Effort", value: data.effortScore },
                { label: "Quality", value: data.qualityScore },
                { label: "Pump", value: data.pump },
              ].map((item) => (
                <View
                  key={item.label}
                  className="flex-1 items-center"
                  style={{
                    backgroundColor: PROGRESS_COLORS.cardBackground,
                    borderRadius: 14,
                    paddingVertical: 16,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color:
                        item.value != null
                          ? getScoreColor(item.value)
                          : PROGRESS_COLORS.tertiaryText,
                    }}
                  >
                    {item.value != null ? item.value : "--"}
                  </Text>
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.context,
                      color: PROGRESS_COLORS.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    {item.value != null ? `/10` : ""}
                  </Text>
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.context,
                      color: PROGRESS_COLORS.tertiaryText,
                      marginTop: 4,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Muscle Distribution */}
        {sortedMuscleGroups.length > 0 && (
          <View>
            <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
              <Activity size={18} color={PROGRESS_COLORS.primaryText} />
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardTitle,
                  color: PROGRESS_COLORS.primaryText,
                }}
              >
                Muscle Groups
              </Text>
            </View>
            <View
              style={{
                backgroundColor: PROGRESS_COLORS.cardBackground,
                borderRadius: 14,
                padding: 16,
                gap: 12,
              }}
            >
              {sortedMuscleGroups.map((entry) => (
                <View key={entry.muscle}>
                  <View className="flex-row justify-between items-center" style={{ marginBottom: 6 }}>
                    <Text
                      style={{
                        ...METRIC_TYPOGRAPHY.cardSubtitle,
                        fontWeight: "500",
                        color: PROGRESS_COLORS.primaryText,
                        textTransform: "capitalize",
                      }}
                    >
                      {entry.muscle}
                    </Text>
                    <Text
                      style={{
                        ...METRIC_TYPOGRAPHY.context,
                        color: PROGRESS_COLORS.secondaryText,
                      }}
                    >
                      {formatVolume(entry.volume)}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: PROGRESS_COLORS.positive.primary + "4D",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.min(entry.percentage, 100)}%`,
                        borderRadius: 3,
                        backgroundColor: PROGRESS_COLORS.positive.primary,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Exercise Breakdown */}
        {data.exercises.length > 0 && (
          <>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: PROGRESS_COLORS.secondaryText + "20",
                paddingTop: 16,
              }}
            >
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardTitle,
                  color: PROGRESS_COLORS.primaryText,
                }}
              >
                Exercise Breakdown
              </Text>
            </View>

            {data.exercises.map((exercise, idx) => (
              <View
                key={`${exercise.exerciseId}-${idx}`}
                className="rounded-2xl border border-border"
                style={{
                  backgroundColor: PROGRESS_COLORS.cardBackground,
                  padding: 20,
                }}
              >
                {/* Exercise Header */}
                <View className="flex-row justify-between items-center" style={{ marginBottom: 8 }}>
                  <View className="flex-1 flex-row items-center" style={{ gap: 8 }}>
                    <Text
                      style={{
                        ...METRIC_TYPOGRAPHY.metricLabel,
                        fontWeight: "600",
                        color: PROGRESS_COLORS.primaryText,
                      }}
                    >
                      {exercise.name}
                    </Text>
                    {exercise.setType && (
                      <View
                        className="rounded-full"
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          backgroundColor: getSetTypeBadgeColor(exercise.setType) + "20",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "600",
                            color: getSetTypeBadgeColor(exercise.setType),
                            textTransform: "capitalize",
                          }}
                        >
                          {exercise.setType.replace(/_/g, " ").toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  {exercise.prBadge && (
                    <View
                      className="flex-row items-center rounded-full"
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        backgroundColor: PROGRESS_COLORS.positive.background,
                        gap: 4,
                      }}
                    >
                      <Trophy size={12} color={PROGRESS_COLORS.positive.primary} />
                      <Text style={{ fontSize: 11, fontWeight: "700", color: PROGRESS_COLORS.positive.primary }}>
                        {exercise.prBadge}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Subtitle row */}
                <View className="flex-row items-center" style={{ marginBottom: 12, gap: 8 }}>
                  {exercise.muscleGroup && (
                    <Text
                      style={{
                        ...METRIC_TYPOGRAPHY.context,
                        color: PROGRESS_COLORS.secondaryText,
                        textTransform: "capitalize",
                      }}
                    >
                      {exercise.muscleGroup}
                    </Text>
                  )}
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.context,
                      color: PROGRESS_COLORS.tertiaryText,
                    }}
                  >
                    {exercise.completedSets}/{exercise.plannedSets} sets
                  </Text>
                </View>

                {/* Exercise Summary Stats */}
                <View
                  className="flex-row"
                  style={{
                    marginBottom: 12,
                    gap: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: PROGRESS_COLORS.secondaryText + "15",
                  }}
                >
                  {[
                    { label: "Vol", value: exercise.completedSets > 0 ? formatVolume(exercise.totalVolume) : "--" },
                    { label: "Peak", value: exercise.completedSets > 0 ? `${exercise.peakWeight}kg` : "--" },
                    { label: "RIR", value: exercise.completedSets > 0 && exercise.averageRir != null ? exercise.averageRir.toFixed(1) : "--" },
                    { label: "Reps", value: exercise.completedSets > 0 ? `${exercise.totalReps}` : "--" },
                  ].map((stat) => (
                    <View key={stat.label} className="flex-1 items-center">
                      <Text
                        style={{
                          ...METRIC_TYPOGRAPHY.cardSubtitle,
                          fontWeight: "600",
                          color: PROGRESS_COLORS.primaryText,
                          fontSize: 13,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          ...METRIC_TYPOGRAPHY.context,
                          color: PROGRESS_COLORS.tertiaryText,
                          fontSize: 10,
                        }}
                      >
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Set Table */}
                {exercise.sets.length > 0 && (
                  <View>
                    <View
                      className="flex-row"
                      style={{
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: PROGRESS_COLORS.secondaryText + "20",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.tertiaryText, width: 36 }}>Set</Text>
                      <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.tertiaryText, flex: 1 }}>Weight</Text>
                      <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.tertiaryText, flex: 1 }}>Reps</Text>
                      <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.tertiaryText, width: 40, textAlign: "right" }}>RIR</Text>
                      <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.tertiaryText, width: 50, textAlign: "right" }}>Vol</Text>
                    </View>
                    {exercise.sets.map((set) => (
                      <View key={set.setNumber} className="flex-row items-center" style={{ paddingVertical: 6 }}>
                        <View className="flex-row items-center" style={{ width: 36, gap: 4 }}>
                          <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.secondaryText }}>
                            {set.setNumber}
                          </Text>
                          {set.isWarmup && (
                            <View
                              className="rounded"
                              style={{
                                paddingHorizontal: 4,
                                paddingVertical: 1,
                                backgroundColor: "#F59E0B20",
                              }}
                            >
                              <Text style={{ fontSize: 9, fontWeight: "700", color: "#F59E0B" }}>W</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.primaryText, fontWeight: "500", flex: 1 }}>
                          {set.weight}kg
                        </Text>
                        <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.primaryText, fontWeight: "500", flex: 1 }}>
                          {set.reps}
                        </Text>
                        <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.secondaryText, width: 40, textAlign: "right" }}>
                          {set.rir ?? "--"}
                        </Text>
                        <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.secondaryText, width: 50, textAlign: "right" }}>
                          {set.volume}kg
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
