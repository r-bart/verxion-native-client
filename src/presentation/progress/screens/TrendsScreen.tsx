import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { PeriodSelector } from "@/presentation/_shared/components/PeriodSelector";
import { ChartCard } from "@/presentation/_shared/components/ChartCard";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { progressScreens } from "../navigation";
import { useBodyComposition } from "../hooks/useBodyComposition";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { ChartPlaceholder } from "../components/ChartPlaceholder";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

const PERIODS = ["1M", "3M", "6M", "1Y", "ALL"];

export function TrendsScreen() {
  const [period, setPeriod] = useState("3M");
  const { data, isLoading, isError, refetch } = useBodyComposition(period);

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={progressScreens} />
        <ProgressSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={progressScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={progressScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <PeriodSelector periods={PERIODS} selected={period} onSelect={setPeriod} />

        <ChartCard
          title="Weight Trend"
          subtitle={`Last ${period}`}
          color="health"
          chart={<ChartPlaceholder label="Weight trend line chart" height={200} />}
        />

        <ChartCard
          title="Steps Trend"
          subtitle={`Last ${period}`}
          color="positive"
          chart={<ChartPlaceholder label="Steps bar chart" height={200} />}
        />

        <ChartCard
          title="Cardio Trend"
          subtitle={`Last ${period}`}
          color="insight"
          chart={<ChartPlaceholder label="Cardio minutes chart" height={200} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
