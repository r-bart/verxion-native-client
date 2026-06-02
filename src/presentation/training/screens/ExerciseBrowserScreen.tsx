import { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { trainingScreens } from "../navigation";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import { useExerciseSearch } from "../hooks/useExerciseSearch";
import { useExerciseFilters } from "../hooks/useExerciseFilters";
import { ExerciseBrowserCard } from "../components/ExerciseBrowserCard";
import { ExerciseBrowserFilters, type ExerciseBrowserFilterState } from "../components/ExerciseBrowserFilters";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import type { ExerciseSearchResult } from "@/domain/training/models/Exercise";

export function ExerciseBrowserScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExerciseBrowserFilterState>({ q: "" });
  const [debouncedQ, setDebouncedQ] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // React Compiler memoizes these callbacks/values; no manual memoization needed.
  const handleFiltersChange = (next: ExerciseBrowserFilterState) => {
    setFilters(next);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQ(next.q), 300);
  };

  const searchParams = {
    q: debouncedQ || undefined,
    bodyPart: filters.bodyPart,
    equipment: filters.equipment,
    target: filters.target,
    customOnly: filters.customOnly,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useExerciseSearch(searchParams);
  const { data: filterOptions } = useExerciseFilters();

  const exercises = data?.pages.flatMap((page) => page) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const navigateToDetail = (exercise: ExerciseSearchResult) => {
    router.push(`/training/exercise/detail/${exercise.id}`);
  };

  const renderItem = ({ item }: { item: ExerciseSearchResult }) => (
    <ExerciseBrowserCard exercise={item} onPress={() => navigateToDetail(item)} />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <ScreenSelector options={trainingScreens} />
      <ExerciseBrowserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
      />

      {isLoading ? (
        <TrainingSkeleton />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No exercises found"
          message={filters.q || filters.bodyPart || filters.equipment || filters.target
            ? "Try adjusting your search or filters."
            : "Exercises will appear here once loaded."}
        />
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500" }}>
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator style={{ paddingVertical: 20 }} color={PROGRESS_COLORS.secondaryText} />
              ) : null
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}
