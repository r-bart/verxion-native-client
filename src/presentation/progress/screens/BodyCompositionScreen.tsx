import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { MetricCard } from "@/presentation/_shared/components/MetricCard";
import { PeriodSelector } from "@/presentation/_shared/components/PeriodSelector";
import { ChartCard } from "@/presentation/_shared/components/ChartCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { ListCard } from "@/presentation/_shared/components/ListCard";
import { progressScreens } from "../navigation";
import { useBodyComposition } from "../hooks/useBodyComposition";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { ChartPlaceholder } from "../components/ChartPlaceholder";
import { Scale, Ruler } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const PERIODS = ["1M", "3M", "6M", "1Y", "ALL"];

function formatWeight(value: number | null | undefined): string {
  if (value == null) return "--";
  return value.toFixed(1);
}

function formatChange(value: number | null | undefined): string {
  if (value == null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

export function BodyCompositionScreen() {
  const [period, setPeriod] = useState("3M");
  const { data, isLoading, isError, refetch } = useBodyComposition(period);

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

  if (!data || (data.weightTrend.length === 0 && Object.keys(data.perimeterTrend).length === 0)) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ScreenSelector options={progressScreens} />
        <EmptyState icon="📏" title="No body composition data" message="Log your weight or body measurements to see trends here." />
      </SafeAreaView>
    );
  }

  const changeColor = data.weightChange !== null
    ? data.weightChange < 0 ? "positive" : data.weightChange > 0 ? "health" : "neutral"
    : "neutral";

  const perimeterKeys = Object.keys(data.perimeterTrend);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <ScreenSelector options={progressScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <PeriodSelector periods={PERIODS} selected={period} onSelect={setPeriod} />

        {/* Weight Stats */}
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <MetricCard
              value={formatWeight(data.currentWeight)}
              label="Current Weight"
              color="health"
              icon={<Scale size={24} color={PROGRESS_COLORS.health.primary} />}
              footer="kg"
            />
          </View>
          <View className="flex-1">
            <MetricCard
              value={formatChange(data.weightChange)}
              label="Change"
              color={changeColor as any}
              footer="kg"
            />
          </View>
        </View>

        {/* Weight Chart */}
        {data.weightTrend.length > 0 && (
          <ChartCard
            title="Weight Trend"
            subtitle={`Last ${period}`}
            color="health"
            chart={<ChartPlaceholder label="Weight trend line chart" height={200} />}
          />
        )}

        {/* Weight Summary */}
        {data.weightSummary && (
          <ListCard
            title="Weight Summary"
            color="health"
            items={[
              { label: "Current", value: `${formatWeight(data.weightSummary.current)} kg` },
              { label: "Previous", value: `${formatWeight(data.weightSummary.previous)} kg` },
              {
                label: "Change",
                value: data.weightSummary.changePercent !== null
                  ? `${data.weightSummary.changePercent > 0 ? "+" : ""}${data.weightSummary.changePercent.toFixed(1)}%`
                  : "--",
              },
            ]}
          />
        )}

        {/* Perimeters Section */}
        {perimeterKeys.length > 0 && (
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
                  marginBottom: 4,
                }}
              >
                Perimeters
              </Text>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardSubtitle,
                  color: PROGRESS_COLORS.secondaryText,
                }}
              >
                Body measurements over time
              </Text>
            </View>

            {perimeterKeys.map((key) => {
              const points = data.perimeterTrend[key];
              const latest = points.length > 0 ? points[points.length - 1] : null;
              const first = points.length > 0 ? points[0] : null;
              const change = latest && first ? latest.value - first.value : null;
              const changeStr = change !== null ? `${change > 0 ? "+" : ""}${change.toFixed(1)} cm` : "";

              return (
                <View
                  key={key}
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
                        backgroundColor: PROGRESS_COLORS.body.background,
                      }}
                    >
                      <Ruler size={20} color={PROGRESS_COLORS.body.primary} />
                    </View>
                    <Text
                      style={{
                        ...METRIC_TYPOGRAPHY.metricLabel,
                        fontWeight: "600",
                        color: PROGRESS_COLORS.primaryText,
                        textTransform: "capitalize",
                      }}
                    >
                      {key}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: PROGRESS_COLORS.body.primary,
                      }}
                    >
                      {latest ? latest.value.toFixed(1) : "--"} cm
                    </Text>
                    {change !== null && (
                      <Text
                        style={{
                          ...METRIC_TYPOGRAPHY.context,
                          color: change < 0 ? PROGRESS_COLORS.positive.primary : change > 0 ? PROGRESS_COLORS.health.primary : PROGRESS_COLORS.secondaryText,
                          marginTop: 2,
                        }}
                      >
                        {changeStr}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
