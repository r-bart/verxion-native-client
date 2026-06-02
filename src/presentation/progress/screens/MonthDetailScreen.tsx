import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { ListCard } from "@/presentation/_shared/components/ListCard";
import { useMonthDetail } from "../hooks/useMonthDetail";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { ChevronLeft, Activity, Dumbbell, Target, Timer } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function MonthDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMonthDetail(date ?? "");

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
        <EmptyState message="Month data not found." />
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
            {data.month}
          </Text>
        </View>

        {/* Month Totals */}
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={data.totals.sessions}
              label="Sessions"
              color="positive"
              icon={<Activity size={24} color={PROGRESS_COLORS.positive.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={(data.totals.volume / 1000).toFixed(1)}
              label="Volume (t)"
              color="health"
              icon={<Dumbbell size={24} color={PROGRESS_COLORS.health.primary} />}
            />
          </View>
        </View>
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={`${Math.round(data.totals.adherence)}%`}
              label="Adherence"
              color="neutral"
              icon={<Target size={24} color={PROGRESS_COLORS.neutral.primary} />}
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={data.totals.cardioMinutes}
              label="Cardio (min)"
              color="insight"
              icon={<Timer size={24} color={PROGRESS_COLORS.insight.primary} />}
            />
          </View>
        </View>

        {/* Narrative */}
        {data.narrative && (
          <View
            className="rounded-2xl border border-border"
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              padding: 20,
            }}
          >
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.primaryText,
                lineHeight: 22,
              }}
            >
              {data.narrative}
            </Text>
          </View>
        )}

        {/* Weekly Breakdown */}
        <ListCard
          title="Weekly Breakdown"
          color="positive"
          items={data.weeks.map((week) => ({
            label: `Week of ${new Date(week.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
            value: `${(week.volume / 1000).toFixed(1)}t`,
            subtitle: `${week.sessions} sessions`,
          }))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
