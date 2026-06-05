/**
 * SegmentError — the shared error state for an Entreno landing segment: a glass
 * card with a message and a retry button. One place so every segment fails the
 * same way.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

export function SegmentError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <GlassSurface radius={20} style={{ padding: 22, alignItems: "center", gap: 12 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
        {t("common.somethingWentWrong")}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
        <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("common.retry")}</Text>
        </View>
      </Pressable>
    </GlassSurface>
  );
}
