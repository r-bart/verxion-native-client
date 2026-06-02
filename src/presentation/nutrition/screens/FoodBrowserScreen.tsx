import { useState, useDeferredValue } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { SearchBar } from "@/presentation/_shared/components/SearchBar";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { nutritionScreens } from "../navigation";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { FoodListItem } from "../components/FoodListItem";
import { NutritionSkeleton } from "../components/NutritionSkeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export function FoodBrowserScreen() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading, isError, refetch } = useFoodSearch({
    q: deferredQuery || undefined,
    limit: 50,
  });

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={nutritionScreens} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search foods..." />
      </View>

      {isLoading ? (
        <NutritionSkeleton />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No foods found"
          message={query ? "Try a different search term." : "No foods available."}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FoodListItem food={item} />}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
