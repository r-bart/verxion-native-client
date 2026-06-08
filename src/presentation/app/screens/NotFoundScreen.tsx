import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { glass } from "@/presentation/_shared/design/glass";

/**
 * Branded blank-slate for unknown deep links (Expo Router's `+not-found`).
 * Mirrors the ComingSoon layout — screen bloom + centered EmptyState — but adds
 * a "back to Today" action so a bad URL never strands the user on the default
 * Expo error screen.
 */
export function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={<Compass size={28} color={glass.ink2} strokeWidth={2} />}
            title={t("notFound.title")}
            body={t("notFound.body")}
            action={
              <OnboardingButton
                label={t("notFound.action")}
                onPress={() => router.replace("/today")}
              />
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
