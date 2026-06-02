import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GreetingHeader } from "../components/GreetingHeader";
import { TrainingStateCard } from "../components/TrainingStateCard";
import { NutritionDayCard } from "../components/NutritionDayCard";
import { WeeklyRingsCard } from "../components/WeeklyRingsCard";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        ...METRIC_TYPOGRAPHY.context,
        fontWeight: "600",
        color: PROGRESS_COLORS.secondaryText,
        letterSpacing: 1,
        textTransform: "uppercase",
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      {title}
    </Text>
  );
}

export function TodayScreen() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#000000" }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader />
        <View style={{ height: 12 }} />

        <SectionHeader title="Training" />
        <TrainingStateCard />

        <SectionHeader title="Nutrition" />
        <NutritionDayCard />

        <SectionHeader title="This Week" />
        <WeeklyRingsCard />
      </ScrollView>
    </SafeAreaView>
  );
}
