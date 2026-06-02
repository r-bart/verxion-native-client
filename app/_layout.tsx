import "../src/presentation/_shared/styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "@/presentation/app/AppProvider";
import { AppShell } from "@/presentation/app/AppShell";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
