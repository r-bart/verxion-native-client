import { Stack } from "expo-router";
import { AuthGuard } from "@/presentation/auth/components/AuthGuard";
import { useHealthAutoSync } from "./useHealthAutoSync";

/**
 * Root navigator. A Stack (not a bare Slot) so screens like Settings can be
 * pushed above the tab bar and cover it. The route groups — (auth),
 * (onboarding), (tabs) — and `settings` / `programas` are auto-registered by
 * their files; AuthGuard drives which group is active.
 */
export function AppShell() {
  useHealthAutoSync(); // HealthKit → platform sync on launch / foreground (inert until the native binding)
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="programas" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthGuard>
  );
}
