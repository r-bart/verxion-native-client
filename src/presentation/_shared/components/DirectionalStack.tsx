import { Stack } from "expo-router";

interface DirectionalStackProps {
  routePrefix: string;
}

export function DirectionalStack(_props: DirectionalStackProps) {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
