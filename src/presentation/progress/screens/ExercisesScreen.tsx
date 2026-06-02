import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { progressScreens } from "../navigation";
import { useExerciseStats } from "../hooks/useExerciseStats";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { Dumbbell, Target, TrendingUp } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function ExercisesScreen() {
  const { data, isLoading, isError, refetch } = useExerciseStats();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ScreenSelector options={progressScreens} />
        <ProgressSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ScreenSelector options={progressScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ScreenSelector options={progressScreens} />
        <EmptyState icon="💪" title="No exercise data" message="Complete some workouts to see your exercise statistics here." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <ScreenSelector options={progressScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lifetime Stats */}
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            marginBottom: -4,
          }}
        >
          Lifetime exercise statistics across all workouts
        </Text>

        <MetricCard
          value={((data.totalVolume) / 1000).toFixed(1)}
          label="Total Volume (tons)"
          color="health"
          icon={<Dumbbell size={24} color={PROGRESS_COLORS.health.primary} />}
          subtitle="Lifetime"
        />

        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={data.uniqueExercises}
              label="Unique Exercises"
              color="neutral"
              icon={<Target size={24} color={PROGRESS_COLORS.neutral.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.trainingDays}
              label="Training Days"
              color="positive"
              icon={<TrendingUp size={24} color={PROGRESS_COLORS.positive.primary} />}
            />
          </View>
        </View>

        {/* Muscle Group Breakdown */}
        {data.muscleGroups.length > 0 && (
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
                By Muscle Group
              </Text>
            </View>

            {data.muscleGroups.map((mg) => {
              const isTop3 = mg.rank <= 3;
              return (
                <View
                  key={mg.name}
                  className="flex-row items-center justify-between rounded-2xl border border-border"
                  style={{
                    backgroundColor: PROGRESS_COLORS.cardBackground,
                    padding: 20,
                  }}
                >
                  <View className="flex-row items-center" style={{ gap: 12 }}>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isTop3
                          ? PROGRESS_COLORS.health.background
                          : PROGRESS_COLORS.cardBackground,
                        borderWidth: isTop3 ? 0 : 1,
                        borderColor: PROGRESS_COLORS.tertiaryText,
                      }}
                    >
                      <Text style={{ fontSize: isTop3 ? 18 : 14, fontWeight: "700", color: isTop3 ? PROGRESS_COLORS.health.primary : PROGRESS_COLORS.secondaryText }}>
                        {isTop3 ? RANK_MEDALS[mg.rank - 1] : `#${mg.rank}`}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          ...METRIC_TYPOGRAPHY.metricLabel,
                          fontWeight: "600",
                          color: PROGRESS_COLORS.primaryText,
                          textTransform: "capitalize",
                        }}
                      >
                        {mg.name}
                      </Text>
                      <Text
                        style={{
                          ...METRIC_TYPOGRAPHY.context,
                          color: PROGRESS_COLORS.secondaryText,
                          marginTop: 2,
                        }}
                      >
                        {mg.sets} sets
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: isTop3 ? PROGRESS_COLORS.health.primary : PROGRESS_COLORS.neutral.primary,
                    }}
                  >
                    {(mg.volume / 1000).toFixed(1)}t
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
