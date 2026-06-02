import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { nutritionScreens } from "../navigation";
import { useDailyMealLogs } from "../hooks/useDailyMealLogs";
import { DateNavigator } from "../components/DateNavigator";
import { MacroGrid } from "../components/MacroGrid";
import { MealCard } from "../components/MealCard";
import { NutritionSkeleton } from "../components/NutritionSkeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function MealLogsScreen() {
  const [date, setDate] = useState(() => toDateStr(new Date()));
  const { data, isLoading, isError, refetch } = useDailyMealLogs(date);

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={nutritionScreens} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <DateNavigator
          date={date}
          onPrev={() => setDate(shiftDate(date, -1))}
          onNext={() => setDate(shiftDate(date, 1))}
        />

        {isLoading ? (
          <NutritionSkeleton />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data || !data.meals || data.meals.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No meals logged"
            message="No meal logs found for this day."
          />
        ) : (
          <>
            <MacroGrid
              calories={data.totalCalories}
              protein={data.totalProtein}
              carbs={data.totalCarbs}
              fat={data.totalFat}
            />

            {data.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
