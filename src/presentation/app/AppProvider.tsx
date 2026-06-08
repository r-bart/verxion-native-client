import { QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { queryClient } from "@/infrastructure/di/queryClient";
import { DIProvider } from "@/infrastructure/di/DIContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  // i18n and telemetry bootstrap at DI wiring time inside infrastructure, so
  // this stays free of direct infrastructure imports beyond `di/`.
  //
  // NOTE: the TanStack Query dev-plugin (`@dev-plugins/react-query`) was removed
  // — with the inspector attached, its Expo SharedObject event emission tripped
  // a Hermes debugger crash (`Debugger::runUntilValidPauseLocation` SIGSEGV).
  return (
    <QueryClientProvider client={queryClient}>
      <DIProvider>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
      </DIProvider>
    </QueryClientProvider>
  );
}
