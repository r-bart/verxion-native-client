import { FlatList, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLiveProgress } from "../hooks/useLiveProgress";
import { useLiveSessionProgression } from "../hooks/useLiveSessionProgression";
import { usePreviousExerciseMap } from "../hooks/usePreviousExerciseMap";
import { SessionHeader } from "../components/SessionHeader";
import { KpiRow } from "../components/KpiRow";
import { ExerciseCard } from "../components/ExerciseCard";
import { PreviousSessionBanner } from "../components/PreviousSessionBanner";
import { RefreshIndicator } from "../components/RefreshIndicator";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";
import { ChevronLeft, Radio, Pause } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import { computeSessionProgressionScore } from "@/domain/sessions/overload";

export function SessionViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, dataUpdatedAt } = useLiveProgress(id);

  const targetMap = useLiveSessionProgression(data?.session.workoutDayId);
  const previousMap = usePreviousExerciseMap(data?.previousSession);

  // React Compiler memoizes these; no manual useMemo needed.
  const progressionScore =
    data && previousMap.size > 0
      ? computeSessionProgressionScore(data.exercises, previousMap)
      : undefined;

  const isPaused = data?.session.status === "paused";
  const badgeColor = isPaused ? "#F59E0B" : PROGRESS_COLORS.positive.primary;
  const badgeBg = isPaused ? "rgba(245,158,11,0.15)" : PROGRESS_COLORS.positive.background;
  const BadgeIcon = isPaused ? Pause : Radio;
  const badgeLabel = isPaused ? "Paused" : "Live Session";

  const ListHeader = (() => {
    if (!data) return null;
    return (
      <>
        <SessionHeader data={data} />
        <KpiRow progress={data.progress} progressionScore={progressionScore} />
        {data.previousSession && (
          <PreviousSessionBanner
            current={data.progress}
            previous={data.previousSession}
            progressionScore={progressionScore}
          />
        )}
      </>
    );
  })();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} color={PROGRESS_COLORS.primaryText} />
        </Pressable>
        <View
          className="flex-row items-center rounded-full"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: badgeBg,
            gap: 6,
          }}
        >
          <BadgeIcon size={14} color={badgeColor} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: badgeColor,
            }}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1" style={{ padding: 24, gap: 16 }}>
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </View>
      ) : !data ? (
        <View className="flex-1 items-center justify-center">
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardTitle,
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            Session not found
          </Text>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.secondaryText,
              marginTop: 8,
            }}
          >
            This session may have ended
          </Text>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          data={data.exercises}
          keyExtractor={(item) => item.sessionExerciseId}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              previousExercise={previousMap.get(item.exerciseId)}
              progressionTarget={targetMap.get(item.exerciseId)}
            />
          )}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={<RefreshIndicator dataUpdatedAt={dataUpdatedAt} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
