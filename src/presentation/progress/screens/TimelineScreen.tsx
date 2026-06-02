import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { PeriodSelector } from "@/presentation/_shared/components/PeriodSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { historyScreens } from "../navigation";
import { useTimeline } from "../hooks/useTimeline";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { Activity, Dumbbell, TrendingUp } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const MONTH_OPTIONS: { label: string; value: number }[] = [
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
  { label: "24M", value: 24 },
];

export function TimelineScreen() {
  const [months, setMonths] = useState(12);
  const { data, isLoading, isError, refetch } = useTimeline(months);

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
        <EmptyState icon="📊" title="No timeline data" message="Start training to see your progress timeline." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={historyScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <PeriodSelector
          periods={MONTH_OPTIONS.map((o) => o.label)}
          selected={MONTH_OPTIONS.find((o) => o.value === months)?.label ?? "12M"}
          onSelect={(label) => {
            const opt = MONTH_OPTIONS.find((o) => o.label === label);
            if (opt) setMonths(opt.value);
          }}
        />

        {data.map((entry) => (
          <View
            key={entry.month}
            className="rounded-2xl border border-border"
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              padding: 20,
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center" style={{ marginBottom: 16 }}>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.metricLabel,
                  fontWeight: "700",
                  color: PROGRESS_COLORS.primaryText,
                }}
              >
                {entry.month}
              </Text>
              {entry.deltaPercent !== null && (
                <View
                  className="rounded-full"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor:
                      entry.deltaPercent > 0
                        ? PROGRESS_COLORS.positive.background
                        : entry.deltaPercent < 0
                          ? PROGRESS_COLORS.health.background
                          : PROGRESS_COLORS.cardBackground,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color:
                        entry.deltaPercent > 0
                          ? PROGRESS_COLORS.positive.primary
                          : entry.deltaPercent < 0
                            ? PROGRESS_COLORS.health.primary
                            : PROGRESS_COLORS.secondaryText,
                    }}
                  >
                    {entry.deltaPercent > 0 ? "+" : ""}
                    {entry.deltaPercent.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>

            {/* Metrics Grid */}
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                  <Activity size={14} color={PROGRESS_COLORS.positive.primary} />
                  <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Sessions</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.positive.primary }}>
                  {entry.sessions}
                </Text>
              </View>
              <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                  <Dumbbell size={14} color={PROGRESS_COLORS.health.primary} />
                  <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Volume</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.health.primary }}>
                  {(entry.volume / 1000).toFixed(1)}t
                </Text>
              </View>
              <View className="flex-1 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 12 }}>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                  <TrendingUp size={14} color={PROGRESS_COLORS.insight.primary} />
                  <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>Cardio</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.insight.primary }}>
                  {entry.cardioMinutes}m
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
