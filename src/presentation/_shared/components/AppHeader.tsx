/**
 * AppHeader — the in-screen chrome header shared across tabs: brand mark on the
 * left, the glass avatar sphere on the right (the Settings entry point). Sits
 * transparently over the ScreenBloom; screens render it at the top of their
 * content (the native tab bar owns the bottom).
 */
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { Wordmark } from "@/presentation/_shared/components/Wordmark";
import { GlassAvatarButton } from "@/presentation/_shared/components/GlassAvatarButton";
import { initials } from "@/presentation/_shared/lib/initials";
import { glass } from "@/presentation/_shared/design/glass";

export function AppHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: user } = useCurrentUser();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
        <Isotype size={24} glow />
        <Wordmark size={18} color={glass.white} />
      </View>

      <GlassAvatarButton
        initials={initials(user?.name, user?.username, user?.email)}
        accessibilityLabel={t("settings.title")}
        onPress={() => router.push("/settings")}
      />
    </View>
  );
}
