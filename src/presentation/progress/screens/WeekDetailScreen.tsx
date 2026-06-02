import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { useWeekDetail } from "../hooks/useWeekDetail";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { ChevronLeft, Activity, Dumbbell, Timer } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useWeekDetail(date ?? "");

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
        <EmptyState message="Week data not found." />
      </SafeAreaView>
    );
  }

  const startDate = new Date(data.weekStart);
  const endDate = new Date(data.weekEnd);
  const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

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
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            {startDate.toLocaleDateString(undefined, dateOpts)} -{" "}
            {endDate.toLocaleDateString(undefined, dateOpts)}
          </Text>
        </View>

        {/* Week Totals */}
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
        <MetricCard
          value={data.totals.cardioMinutes}
          label="Cardio Minutes"
          color="insight"
          icon={<Timer size={24} color={PROGRESS_COLORS.insight.primary} />}
        />

        {/* Daily Breakdown */}
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
            Daily Breakdown
          </Text>
        </View>

        {data.days.map((day) => {
          const dayDate = new Date(day.date);
          const dayName = DAY_NAMES[dayDate.getDay()];
          const hasActivity = day.sessions > 0 || day.volume > 0;

          return (
            <View
              key={day.date}
              className="flex-row items-center justify-between rounded-2xl border border-border"
              style={{
                backgroundColor: PROGRESS_COLORS.cardBackground,
                padding: 16,
                opacity: hasActivity ? 1 : 0.4,
              }}
            >
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: hasActivity
                      ? PROGRESS_COLORS.positive.background
                      : "transparent",
                    borderWidth: hasActivity ? 0 : 1,
                    borderColor: PROGRESS_COLORS.tertiaryText,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: hasActivity
                        ? PROGRESS_COLORS.positive.primary
                        : PROGRESS_COLORS.tertiaryText,
                    }}
                  >
                    {dayName}
                  </Text>
                </View>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.context,
                    color: PROGRESS_COLORS.secondaryText,
                  }}
                >
                  {dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 16 }}>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    fontWeight: "600",
                    color: PROGRESS_COLORS.primaryText,
                  }}
                >
                  {day.sessions} session{day.sessions !== 1 ? "s" : ""}
                </Text>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    color: PROGRESS_COLORS.secondaryText,
                  }}
                >
                  {(day.volume / 1000).toFixed(1)}t
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
