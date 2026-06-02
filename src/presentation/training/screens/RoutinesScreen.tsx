import { useState } from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { trainingScreens } from "../navigation";
import { useRoutines } from "../hooks/useRoutines";
import { RoutineCard } from "../components/RoutineCard";
import { RoutineFilters, type RoutineStatusFilter } from "../components/RoutineFilters";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        ...METRIC_TYPOGRAPHY.metricLabel,
        color: PROGRESS_COLORS.secondaryText,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginTop: 8,
      }}
    >
      {title}
    </Text>
  );
}

export function RoutinesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useRoutines();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoutineStatusFilter>("all");

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  // React Compiler memoizes this derivation; no manual useMemo needed.
  const { activeRoutine, otherRoutines } = (() => {
    if (!data) return { activeRoutine: null, otherRoutines: [] };

    let filtered = data;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.goal?.replace(/_/g, " ").toLowerCase().includes(q)
      );
    }

    return {
      activeRoutine: filtered.find((r) => r.status === "active") ?? null,
      otherRoutines: filtered.filter((r) => r.status !== "active"),
    };
  })();

  const isEmpty = !activeRoutine && otherRoutines.length === 0;
  const isFiltering = search.trim() !== "" || statusFilter !== "all";

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <TrainingSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <EmptyState
          icon="💪"
          title="No routines yet"
          message="Create routines via the assistant to see them here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={trainingScreens} />
      <RoutineFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {isEmpty ? (
        <EmptyState
          icon="🔍"
          title="No routines found"
          message={isFiltering ? "Try adjusting your search or filters." : "No routines to show."}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={PROGRESS_COLORS.secondaryText}
            />
          }
        >
          {activeRoutine && (
            <View style={{ marginBottom: 24 }}>
              <SectionHeader title="Active Routine" />
              <RoutineCard
                routine={activeRoutine}
                onPress={() => router.push(`/training/routine/${activeRoutine.id}`)}
              />
            </View>
          )}

          {otherRoutines.length > 0 && (
            <View>
              {activeRoutine && <SectionHeader title="Other Routines" />}
              <View style={{ gap: 12 }}>
                {otherRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onPress={() => router.push(`/training/routine/${routine.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
