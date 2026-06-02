import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { progressScreens } from "../navigation";
import { useProgressOverview } from "../hooks/useProgressOverview";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import {
  Activity,
  Dumbbell,
  Flame,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
} from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const quickAccessItems = [
  { label: "Timeline", icon: TrendingUp, route: "/progress/timeline", color: PROGRESS_COLORS.insight },
  { label: "Weeks", icon: Calendar, route: "/progress/weeks", color: PROGRESS_COLORS.positive },
  { label: "Months", icon: BarChart3, route: "/progress/months", color: PROGRESS_COLORS.neutral },
  { label: "Exercises", icon: Target, route: "/progress/exercises", color: PROGRESS_COLORS.health },
] as const;

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function OverviewScreen() {
  const { data, isLoading, isError, refetch } = useProgressOverview();
  const router = useRouter();

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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <ScreenSelector options={progressScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={{ gap: 16 }}>
          <MetricCard
            value={data?.totalSessions ?? 0}
            label="Total Sessions"
            color="positive"
            icon={<Activity size={24} color={PROGRESS_COLORS.positive.primary} />}
            subtitle="All time"
          />
          <MetricCard
            value={((data?.totalVolume ?? 0) / 1000).toFixed(1)}
            label="Total Volume (tons)"
            color="health"
            icon={<Dumbbell size={24} color={PROGRESS_COLORS.health.primary} />}
            subtitle="Lifetime"
          />
          <View className="flex-row" style={{ gap: 16 }}>
            <View className="flex-1">
              <MetricCard
                value={data?.currentStreak ?? 0}
                label="Current Streak"
                color="neutral"
                footer="days"
                icon={<Flame size={24} color={PROGRESS_COLORS.neutral.primary} />}
              />
            </View>
            <View className="flex-1">
              <MetricCard
                value={formatDuration(data?.totalDuration ?? 0)}
                label="Total Time"
                color="insight"
                icon={<Clock size={24} color={PROGRESS_COLORS.insight.primary} />}
              />
            </View>
          </View>
        </View>

        {/* Week Summary */}
        <View
          className="rounded-2xl border border-border"
          style={{
            backgroundColor: PROGRESS_COLORS.cardBackground,
            padding: 24,
          }}
        >
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardTitle,
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 20,
            }}
          >
            This Week
          </Text>
          <View className="flex-row" style={{ gap: 16 }}>
            <View className="flex-1 items-center">
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: PROGRESS_COLORS.positive.primary,
                }}
              >
                {data?.weekSummary.sessions ?? 0}
              </Text>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.context,
                  color: PROGRESS_COLORS.secondaryText,
                  marginTop: 4,
                }}
              >
                Sessions
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: PROGRESS_COLORS.secondaryText + "20",
              }}
            />
            <View className="flex-1 items-center">
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: PROGRESS_COLORS.health.primary,
                }}
              >
                {((data?.weekSummary.volume ?? 0) / 1000).toFixed(1)}
              </Text>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.context,
                  color: PROGRESS_COLORS.secondaryText,
                  marginTop: 4,
                }}
              >
                Volume (t)
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: PROGRESS_COLORS.secondaryText + "20",
              }}
            />
            <View className="flex-1 items-center">
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: PROGRESS_COLORS.neutral.primary,
                }}
              >
                {Math.round(data?.weekSummary.adherence ?? 0)}%
              </Text>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.context,
                  color: PROGRESS_COLORS.secondaryText,
                  marginTop: 4,
                }}
              >
                Adherence
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Access Grid */}
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.context,
            color: PROGRESS_COLORS.secondaryText,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Analytics
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            const colorObj = item.color;
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as any)}
                className="active:opacity-80"
                style={{ width: "48%" }}
              >
                <View
                  className="items-center rounded-2xl border border-border"
                  style={{
                    backgroundColor: PROGRESS_COLORS.cardBackground,
                    paddingVertical: 24,
                    paddingHorizontal: 16,
                  }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor:
                        typeof colorObj === "string" ? colorObj + "20" : colorObj.background,
                      marginBottom: 12,
                    }}
                  >
                    <Icon
                      size={24}
                      color={
                        typeof colorObj === "string" ? colorObj : colorObj.primary
                      }
                    />
                  </View>
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.metricLabel,
                      fontWeight: "600",
                      color: PROGRESS_COLORS.primaryText,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
