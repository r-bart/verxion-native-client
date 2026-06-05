/**
 * SesionesScreen — the full session history, grouped by block (routine).
 * Phase 0: scaffold + demo push into a session report.
 */
import { Pressable, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function SesionesScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <DetailScaffold title={t("training.screens.sessions")}>
      <WipBody screen={t("training.screens.sessions")} />
      <Pressable onPress={() => router.push("/workout/sesiones/demo" as Href)}>
        <GlassSurface radius={16} style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.lava }}>
            Push A · 26 may →
          </Text>
        </GlassSurface>
      </Pressable>
    </DetailScaffold>
  );
}
