import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { nutritionScreens } from "../navigation";
import { useDietPlans } from "../hooks/useDietPlans";
import { DietPlanCard } from "../components/DietPlanCard";
import { NutritionSkeleton } from "../components/NutritionSkeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export function DietPlansScreen() {
  const { data, isLoading, isError, refetch } = useDietPlans();
  const router = useRouter();

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={nutritionScreens} />
        <NutritionSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={nutritionScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={nutritionScreens} />
        <EmptyState
          icon="🥗"
          title="No diet plans yet"
          message="Create diet plans via the assistant to see them here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={nutritionScreens} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DietPlanCard
            plan={item}
            onPress={() => router.push(`/nutrition/diet-plan/${item.id}`)}
          />
        )}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
