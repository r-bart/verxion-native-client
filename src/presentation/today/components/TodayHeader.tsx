/**
 * TodayHeader — the "Hoy" header (handoff `01-Hoy`): the full date as the title
 * on the left, and the glass avatar (the Settings entry) on the right. It's the
 * "Hoy" tab, so the date is the headline; the avatar keeps Settings reachable.
 */
import { View, Text, Pressable } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react-native";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { GlassAvatarButton } from "@/presentation/_shared/components/GlassAvatarButton";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
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

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable
          onPress={() => router.push("/programas" as Href)}
          accessibilityRole="button"
          accessibilityLabel={t("program.title")}
          style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
        >
          <GlassSurface radius={19} style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
            <Layers size={18} color={glass.white} strokeWidth={2} />
          </GlassSurface>
        </Pressable>

        <GlassAvatarButton
          initials={initials(user?.name, user?.username, user?.email)}
          accessibilityLabel={t("settings.title")}
          onPress={() => router.push("/settings" as Href)}
        />
      </View>
    </View>
  );
}
