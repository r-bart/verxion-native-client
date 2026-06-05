import { Stack } from "expo-router";
import { AuthGuard } from "@/presentation/auth/components/AuthGuard";

/**
 * Root navigator. A Stack (not a bare Slot) so screens like Settings can be
 * pushed above the tab bar and cover it. The route groups — (auth),
 * (onboarding), (tabs) — and `settings` are auto-registered by their files;
 * AuthGuard drives which group is active.
 */
export function AppShell() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthGuard>
  );
}
