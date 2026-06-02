import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/infrastructure/di/queryClient";
import { DIProvider } from "@/infrastructure/di/DIContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DIProvider>{children}</DIProvider>
    </QueryClientProvider>
  );
}
