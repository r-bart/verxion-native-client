import "../src/presentation/_shared/styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "@/presentation/app/AppProvider";
import { AppShell } from "@/presentation/app/AppShell";
import { useAppFonts } from "@/presentation/_shared/design/fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  // Keep the splash up until the type system is ready; AuthGuard hides it once
  // the session resolves.
  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
