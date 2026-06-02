import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useSession } from "@/presentation/auth/hooks/useSession";
import * as SplashScreen from "expo-splash-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading, isError } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    const hasSession = !!session && !isError;
    if (!hasSession && !inAuth) router.replace("/(auth)/login");
    else if (hasSession && inAuth) router.replace("/(tabs)/today");
  }, [session, isLoading, isError, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#171717", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="hsl(0, 100%, 69%)" />
      </View>
    );
  }

  return <>{children}</>;
}
