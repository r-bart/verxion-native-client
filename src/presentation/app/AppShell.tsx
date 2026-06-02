import { View } from "react-native";
import { Slot } from "expo-router";
import { AuthGuard } from "@/presentation/auth/components/AuthGuard";

export function AppShell() {
  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </AuthGuard>
  );
}
