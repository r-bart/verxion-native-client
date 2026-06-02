import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { ListCard } from "@/presentation/_shared/components/ListCard";
import { useExerciseDetail } from "../hooks/useExerciseDetail";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { ChevronLeft, Dumbbell, TrendingUp, Layers, Repeat, Calendar } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useExerciseDetail(exerciseId ?? "");

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
        <EmptyState message="Exercise not found." />
      </SafeAreaView>
    );
  }

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
          <Text style={{ fontSize: 24, fontWeight: "700", color: PROGRESS_COLORS.primaryText }}>
            {data.exerciseName}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={((data.totalVolume) / 1000).toFixed(1)}
              label="Total Volume (t)"
              color="health"
              icon={<Dumbbell size={24} color={PROGRESS_COLORS.health.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.maxWeight}
              label="Max Weight (kg)"
              color="neutral"
              icon={<TrendingUp size={24} color={PROGRESS_COLORS.neutral.primary} />}
            />
          </View>
        </View>
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={data.totalSets}
              label="Total Sets"
              color="positive"
              icon={<Layers size={24} color={PROGRESS_COLORS.positive.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.totalReps}
              label="Total Reps"
              color="body"
              icon={<Repeat size={24} color={PROGRESS_COLORS.body.primary} />}
            />
          </View>
        </View>
        <MetricCard
          value={data.sessionCount}
          label="Sessions"
          color="insight"
          icon={<Calendar size={24} color={PROGRESS_COLORS.insight.primary} />}
        />

        {/* Session History */}
        {data.sessions.length > 0 && (
          <ListCard
            title="Session History"
            color="health"
            items={data.sessions.map((session) => ({
              label: new Date(session.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              value: `${(session.volume / 1000).toFixed(1)}t`,
              subtitle: `Peak: ${session.peakWeight}kg · ${session.sets} sets · ${session.reps} reps`,
            }))}
            maxItems={10}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
