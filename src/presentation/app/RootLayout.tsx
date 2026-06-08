import "../_shared/styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppFonts } from "@/presentation/_shared/design/fonts";
import { AppProvider } from "./AppProvider";
import { AppShell } from "./AppShell";

SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const fontsLoaded = useAppFonts();

  // Keep the splash up until fonts are ready; AuthGuard hides it once the
  // session resolves.
  if (!fontsLoaded) return null;

  // GestureHandlerRootView is required by @gorhom/bottom-sheet and gesture-
  // driven UI generally, and must wrap the whole app.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
