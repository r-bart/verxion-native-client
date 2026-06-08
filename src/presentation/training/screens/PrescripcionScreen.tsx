/**
 * PrescripcionScreen — today's session (the day's prescription with "Empezar").
 * Phase 0: scaffold + demo push into the live session.
 */
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function PrescripcionScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <DetailScaffold title={t("training.screens.prescription")}>
      <WipBody screen={t("training.screens.prescription")} />
      <Pressable onPress={() => router.push("/workout/sesion")}>
        <GlassSurface radius={9999} style={{ padding: 16, alignItems: "center" }} fallbackFill={glass.lavaBg}>
          <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.lava }}>
            ▶ Empezar sesión
          </Text>
        </GlassSurface>
      </Pressable>
    </DetailScaffold>
  );
}
