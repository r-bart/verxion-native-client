/**
 * RutinasScreen — the routine library (all routines the agent has built).
 * Phase 0: scaffold + a demo push into a routine detail to prove the stack.
 */
import { Pressable, Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function RutinasScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <DetailScaffold title={t("training.screens.routines")}>
      <WipBody screen={t("training.screens.routines")} />
      <Pressable onPress={() => router.push("/workout/rutinas/demo" as Href)}>
        <GlassSurface radius={16} style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.lava }}>
            PPL Hipertrofia →
          </Text>
        </GlassSurface>
      </Pressable>
    </DetailScaffold>
  );
}
