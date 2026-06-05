/**
 * RutinaDetalleScreen — a routine's metadata + its day rotation (read-only).
 * Phase 0: scaffold + demo pushes into a day detail and today's prescription.
 */
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function RutinaDetalleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <DetailScaffold title={t("training.screens.routineDetail")}>
      <WipBody screen={t("training.screens.routineDetail")} params={{ id }} />
      <View style={{ gap: 8 }}>
        <Pressable onPress={() => router.push("/workout/prescripcion" as Href)}>
          <GlassSurface radius={16} style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.lava }}>
              Hoy · Legs A →
            </Text>
          </GlassSurface>
        </Pressable>
        <Pressable onPress={() => router.push("/workout/dia/demo" as Href)}>
          <GlassSurface radius={16} style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.ink2 }}>
              Push A →
            </Text>
          </GlassSurface>
        </Pressable>
      </View>
    </DetailScaffold>
  );
}
