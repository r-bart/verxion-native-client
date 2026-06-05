import { Stack } from "expo-router";

/**
 * Settings navigator. The hub (`index`) and each subscreen are auto-registered
 * by their files under `app/settings/`; subscreens slide in from the right.
 * Lives in presentation so the `app/settings/_layout.tsx` route stays a thin
 * delegator — same split as `AppShell` and `TabLayout`.
 */
export function SettingsStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    />
  );
}
