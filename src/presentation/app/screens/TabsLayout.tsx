import { Tabs } from "expo-router";
import { CalendarRange, Dumbbell, UtensilsCrossed, LineChart } from "lucide-react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PROGRESS_COLORS.positive.primary,
        tabBarInactiveTintColor: PROGRESS_COLORS.tertiaryText,
        tabBarStyle: {
          backgroundColor: PROGRESS_COLORS.cardBackground,
          borderTopColor: PROGRESS_COLORS.tertiaryText + "30",
          borderTopWidth: 1,
          height: 90,
          paddingTop: 4,
          paddingBottom: 24,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <CalendarRange color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Training",
          tabBarIcon: ({ color }) => (
            <Dumbbell color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <UtensilsCrossed color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <LineChart color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
