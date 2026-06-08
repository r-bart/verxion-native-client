import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useSession } from "@/presentation/auth/hooks/useSession";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { useLanguageReconcile } from "@/presentation/_shared/hooks/useLanguageReconcile";

/**
 * Routes the user to the right group based on two gates:
 *  1. session  — no session → (auth)/login.
 *  2. profile  — session but `hasAthleteProfile === false` → (onboarding).
 *                Completed profile in (auth)/(onboarding) → (tabs).
 *
 * The current-user query is only enabled once a session exists, and while it
 * resolves we hold a spinner (rather than flashing the tabs) so a new user
 * isn't briefly shown the app before bouncing into onboarding.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession();
  const hasSession = !!session && !sessionError;

  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser(hasSession);

  // Post-login: adopt the server language if the user has no local override (§8.3).
  useLanguageReconcile({
    enabled: hasSession && !userError,
    serverLanguage: currentUser?.language,
  });

  const segments = useSegments();
  const router = useRouter();

  // `segments[0]` is the active route group. Typed as a string because
  // expo-router's generated route union lags a freshly added group until the
  // dev server regenerates `.expo/types`.
  const group = segments[0] as string | undefined;
  const inAuth = group === "(auth)";
  const inOnboarding = group === "(onboarding)";
  const onboardingHref = "/(onboarding)";

  // Once the session resolves we can drop the native splash; the in-app
  // spinner below covers the brief current-user fetch.
  useEffect(() => {
    if (!sessionLoading) SplashScreen.hideAsync().catch(() => {});
  }, [sessionLoading]);

  // We can decide profile routing only once the user query has settled
  // (treat an error as "let them through" rather than trapping them).
  const profileResolved = !hasSession || !userLoading;
  const needsOnboarding = hasSession && !userError && currentUser?.hasAthleteProfile === false;

  useEffect(() => {
    if (sessionLoading) return;
    if (!hasSession) {
      if (!inAuth) router.replace("/(auth)/login");
      return;
    }
    if (!profileResolved) return;
    if (needsOnboarding) {
      if (!inOnboarding) router.replace(onboardingHref);
      return;
    }
    // Completed profile (or undeterminable) — keep them out of auth/onboarding.
    if (inAuth || inOnboarding) router.replace("/(tabs)/today");
  }, [sessionLoading, hasSession, profileResolved, needsOnboarding, inAuth, inOnboarding, router, onboardingHref]);

  const blocking = sessionLoading || (hasSession && !profileResolved);
  if (blocking) {
    return (
      <View style={{ flex: 1, backgroundColor: "#171717", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="hsl(0, 100%, 69%)" />
      </View>
    );
  }

  return <>{children}</>;
}
