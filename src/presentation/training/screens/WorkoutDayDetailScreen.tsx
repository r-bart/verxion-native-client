import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Target, CalendarDays, Clock } from "lucide-react-native";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { useRoutineDetail } from "../hooks/useRoutineDetail";
import { useWorkoutDayExercises } from "../hooks/useWorkoutDayExercises";
import { ExerciseCard } from "../components/ExerciseCard";
import { SessionHistorySection } from "../components/SessionHistorySection";
import { ProgressionPlanSection } from "../components/ProgressionPlanSection";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function formatRestTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function StatCard({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string | number; subtitle?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {icon}
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>{title}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText }}>{value}</Text>
      {subtitle && (
        <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText, marginTop: 2 }}>{subtitle}</Text>
      )}
    </View>
  );
}

export function WorkoutDayDetailScreen() {
  const { id, routineId } = useLocalSearchParams<{ id: string; routineId: string }>();
  const router = useRouter();

  const { data: routineData, isLoading: routineLoading, isError: routineError, refetch: routineRefetch } = useRoutineDetail(routineId);
  const { data: exercises, isLoading: exercisesLoading, isError: exercisesError, refetch: exercisesRefetch } = useWorkoutDayExercises(routineId, id);

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };
  const isLoading = routineLoading || exercisesLoading;
  const isError = routineError || exercisesError;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <TrainingSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !routineData) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ErrorState onRetry={() => { routineRefetch(); exercisesRefetch(); }} />
      </SafeAreaView>
    );
  }

  const workoutDay = routineData.workoutDays.find((d) => d.id === id);
  if (!workoutDay) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ErrorState onRetry={routineRefetch} />
      </SafeAreaView>
    );
  }

  const isWorkoutType = workoutDay.dayType !== "rest" && workoutDay.dayType !== "active_rest";
  const exerciseList = exercises ?? [];
  const exerciseCount = exerciseList.length;

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Title */}
        <View>
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 }}
          >
            <ChevronLeft size={20} color={PROGRESS_COLORS.positive.primary} />
            <Text style={{ fontSize: 14, color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
              Back
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 6,
            }}
          >
            {workoutDay.name}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: PROGRESS_COLORS.secondaryText,
              textTransform: "capitalize",
            }}
          >
            {workoutDay.dayType.replace(/_/g, " ")}
          </Text>
        </View>

        {/* Description */}
        {workoutDay.description && (
          <View
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: PROGRESS_COLORS.tertiaryText + "20",
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText, marginBottom: 6 }}>
              Description
            </Text>
            <Text style={{ fontSize: 14, color: PROGRESS_COLORS.primaryText, lineHeight: 22 }}>
              {workoutDay.description}
            </Text>
          </View>
        )}

        {/* Stats (workout days only) */}
        {isWorkoutType && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <StatCard
                icon={<Target size={14} color={PROGRESS_COLORS.secondaryText} />}
                title="Exercises"
                value={exerciseCount}
                subtitle={exerciseCount === 1 ? "exercise" : "exercises"}
              />
              <StatCard
                icon={<CalendarDays size={14} color={PROGRESS_COLORS.secondaryText} />}
                title="Position"
                value={workoutDay.orderIndex + 1}
                subtitle="day in routine"
              />
            </View>
            <StatCard
              icon={<Clock size={14} color={PROGRESS_COLORS.secondaryText} />}
              title="Rest Between Exercises"
              value={formatRestTime(workoutDay.restBetweenExercises)}
            />
          </View>
        )}

        {/* Exercises */}
        {isWorkoutType && (
          <View>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardTitle,
                color: PROGRESS_COLORS.primaryText,
                marginBottom: 12,
              }}
            >
              {exerciseCount > 0
                ? `${exerciseCount} ${exerciseCount === 1 ? "Exercise" : "Exercises"}`
                : "Exercises"}
            </Text>

            {exerciseCount > 0 ? (
              <View style={{ gap: 10 }}>
                {exerciseList.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onPress={() => router.push(`/training/exercise/${exercise.id}`)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="💪"
                title="No exercises"
                message="This workout day has no exercises configured yet."
              />
            )}
          </View>
        )}

        {/* Session History */}
        {isWorkoutType && <SessionHistorySection workoutDayId={workoutDay.id} />}

        {/* Progression Plan */}
        {isWorkoutType && <ProgressionPlanSection workoutDayId={workoutDay.id} />}

        {/* Rest day message */}
        {!isWorkoutType && (
          <EmptyState
            icon="☕"
            title="Rest Day"
            message="Take it easy and recover for your next workout."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
