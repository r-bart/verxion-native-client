import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { historyScreens } from "../navigation";
import { useWeeks } from "../hooks/useWeeks";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { Activity, Dumbbell, TrendingUp, ChevronRight } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} - ${e.toLocaleDateString(undefined, opts)}`;
}

export function WeeksScreen() {
  const { data, isLoading, isError, refetch } = useWeeks();
  const router = useRouter();

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={historyScreens} />
        <ProgressSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={historyScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={historyScreens} />
        <EmptyState icon="📅" title="No weekly data" message="Start training to see your weekly summaries." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={historyScreens} />
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.cardSubtitle,
          color: PROGRESS_COLORS.secondaryText,
          paddingHorizontal: 16,
          marginBottom: 4,
        }}
      >
        {data.length} weeks found
      </Text>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {data.map((week) => (
          <Pressable
            key={week.weekStart}
            onPress={() => router.push(`/progress/weeks/${week.weekStart}` as any)}
            className="active:opacity-80"
          >
            <View
              className="rounded-2xl border border-border"
              style={{
                backgroundColor: PROGRESS_COLORS.cardBackground,
                padding: 20,
              }}
            >
              <View className="flex-row justify-between items-center" style={{ marginBottom: 16 }}>
                <View>
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.metricLabel,
                      fontWeight: "700",
                      color: PROGRESS_COLORS.primaryText,
                    }}
                  >
                    {formatDateRange(week.weekStart, week.weekEnd)}
                  </Text>
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.context,
                      color: PROGRESS_COLORS.tertiaryText,
                      marginTop: 2,
                    }}
                  >
                    {new Date(week.weekStart).getFullYear()}
                  </Text>
                </View>
                <ChevronRight size={20} color={PROGRESS_COLORS.secondaryText} />
              </View>

              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                  <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                    <Activity size={14} color={PROGRESS_COLORS.positive.primary} />
                    <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Sessions</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.positive.primary }}>
                    {week.sessions}/{week.targetSessions}
                  </Text>
                </View>
                <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                  <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                    <Dumbbell size={14} color={PROGRESS_COLORS.health.primary} />
                    <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Volume</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.health.primary }}>
                    {(week.volume / 1000).toFixed(1)}t
                  </Text>
                </View>
                <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                  <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                    <TrendingUp size={14} color={PROGRESS_COLORS.insight.primary} />
                    <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Cardio</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.insight.primary }}>
                    {week.cardioMinutes}m
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
