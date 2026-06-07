import { Stack } from "expo-router";

/**
 * Programas navigator. The library (`index`) and the detail screens are
 * auto-registered by their files under `app/programas/`; detail slides in from
 * the right. Lives in presentation so the route layout stays a thin delegator —
 * same split as `SettingsStack` / `AppShell` / `TabLayout`.
 */
export function ProgramStack() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
