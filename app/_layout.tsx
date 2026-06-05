import "../src/presentation/_shared/styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/presentation/app/AppProvider";
import { AppShell } from "@/presentation/app/AppShell";
import { useAppFonts } from "@/presentation/_shared/design/fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  // Keep the splash up until the type system is ready; AuthGuard hides it once
  // the session resolves.
  if (!fontsLoaded) return null;

  // GestureHandlerRootView is required by @gorhom/bottom-sheet (and gesture-
  // driven UI generally) and must wrap the whole app.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
