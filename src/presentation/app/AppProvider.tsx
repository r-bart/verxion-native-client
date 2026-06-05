import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/infrastructure/di/queryClient";
import { DIProvider } from "@/infrastructure/di/DIContext";
// Side-effect import: runs i18next `.init()` once at app startup so every
// `useTranslation()` has an initialized instance (otherwise `t()` returns the
// raw keys). This is the app's i18n bootstrap point.
import "@/infrastructure/i18n/i18n";

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Telemetry (PostHog) is initialized at DI wiring time inside the container,
  // so this stays free of direct infrastructure imports beyond `di/`.
  //
  // NOTE: the TanStack Query dev-plugin (`@dev-plugins/react-query`) was removed
  // — with the inspector attached, its Expo SharedObject event emission tripped
  // a Hermes debugger crash (`Debugger::runUntilValidPauseLocation` SIGSEGV).
  return (
    <QueryClientProvider client={queryClient}>
      <DIProvider>{children}</DIProvider>
    </QueryClientProvider>
  );
}
