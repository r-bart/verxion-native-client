import { NativeTabs } from "expo-router/unstable-native-tabs";

export function TabsLayoutIos() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor="#C6FF00"
    >
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "calendar", selected: "calendar.circle.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="training">
        <NativeTabs.Trigger.Label>Training</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "dumbbell", selected: "dumbbell.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Label>Nutrition</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "fork.knife", selected: "fork.knife.circle.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "chart.line.uptrend.xyaxis",
            selected: "chart.line.uptrend.xyaxis.circle.fill",
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
