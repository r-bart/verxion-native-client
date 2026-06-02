import { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { progressScreens } from "../navigation";
import { useRecords } from "../hooks/useRecords";
import { ProgressSkeleton } from "../components/ProgressSkeleton";
import { Search, Trophy } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function RecordsScreen() {
  const { data, isLoading, isError, refetch } = useRecords();
  const [search, setSearch] = useState("");

  // React Compiler memoizes this; no manual useMemo needed.
  const query = search.trim().toLowerCase();
  const filtered = !data
    ? []
    : query
      ? data.filter((r) => r.exerciseName.toLowerCase().includes(query))
      : data;

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

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ScreenSelector options={progressScreens} />
        <EmptyState icon="🏆" title="No personal records" message="Complete workouts to start tracking your personal records." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <ScreenSelector options={progressScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View
          className="flex-row items-center rounded-2xl"
          style={{
            backgroundColor: PROGRESS_COLORS.cardBackground,
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <Search size={18} color={PROGRESS_COLORS.secondaryText} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises..."
            placeholderTextColor={PROGRESS_COLORS.secondaryText}
            style={{
              flex: 1,
              paddingVertical: 14,
              fontSize: 15,
              color: PROGRESS_COLORS.primaryText,
            }}
          />
        </View>

        {/* Records List */}
        {filtered.length === 0 ? (
          <EmptyState message={`No records matching "${search}"`} />
        ) : (
          filtered.map((record, i) => (
            <View
              key={`${record.exerciseId}-${i}`}
              className="rounded-2xl border border-border"
              style={{
                backgroundColor: PROGRESS_COLORS.cardBackground,
                padding: 20,
              }}
            >
              <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.metricLabel,
                    fontWeight: "600",
                    color: PROGRESS_COLORS.primaryText,
                  }}
                >
                  {record.exerciseName}
                </Text>
                <View
                  className="flex-row items-center rounded-full"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: PROGRESS_COLORS.positive.background,
                    gap: 4,
                  }}
                >
                  <Trophy size={12} color={PROGRESS_COLORS.positive.primary} />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: PROGRESS_COLORS.positive.primary,
                    }}
                  >
                    PR
                  </Text>
                </View>
              </View>
              <View className="flex-row items-baseline" style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: "700",
                    color: PROGRESS_COLORS.health.primary,
                  }}
                >
                  {record.weight}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "500",
                    color: PROGRESS_COLORS.secondaryText,
                  }}
                >
                  kg
                </Text>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    color: PROGRESS_COLORS.secondaryText,
                    marginLeft: 8,
                  }}
                >
                  x {record.reps} reps
                </Text>
              </View>
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.context,
                  color: PROGRESS_COLORS.tertiaryText,
                  marginTop: 8,
                }}
              >
                {new Date(record.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
