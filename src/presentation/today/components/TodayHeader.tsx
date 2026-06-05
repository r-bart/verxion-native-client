/**
 * TodayHeader — the "Hoy" header (handoff `01-Hoy`): the full date as the title
 * on the left, and the glass avatar (the Settings entry) on the right. It's the
 * "Hoy" tab, so the date is the headline; the avatar keeps Settings reachable.
 */
import { View, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { GlassAvatarButton } from "@/presentation/_shared/components/GlassAvatarButton";
import { initials } from "@/presentation/_shared/lib/initials";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { formatDayHeaderFull } from "../lib/format";

export function TodayHeader({ date }: { date: string }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { data: user } = useCurrentUser();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: 4,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          style={{ fontFamily: sans(800), fontSize: 24, letterSpacing: -0.6, color: glass.white }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {formatDayHeaderFull(date, i18n.language)}
        </Text>
      </View>

      <GlassAvatarButton
        initials={initials(user?.name, user?.username, user?.email)}
        accessibilityLabel={t("settings.title")}
        onPress={() => router.push("/settings" as Href)}
      />
    </View>
  );
}
