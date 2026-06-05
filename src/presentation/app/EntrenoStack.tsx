import { Stack } from "expo-router";

/**
 * Entreno navigator. The landing (`index`) and each subscreen are auto-registered
 * by their files under `app/(tabs)/workout/`; detail screens slide in from the
 * right and push over the landing. Lives in presentation so the
 * `app/(tabs)/workout/_layout.tsx` route stays a thin delegator — same split as
 * `AppShell`, `TabLayout`, and `SettingsStack`.
 */
export function EntrenoStack() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}
