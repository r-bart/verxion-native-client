/**
 * SesionDetalleScreen — the persisted report of a completed session (read-only:
 * real per-set breakdown, tiles, rating, muscle groups). Phase 0: scaffold +
 * demo push into an exercise breakdown.
 */
import { Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function SesionDetalleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <DetailScaffold title={t("training.screens.sessionDetail")}>
      <WipBody screen={t("training.screens.sessionDetail")} params={{ id }} />
      <Pressable onPress={() => router.push("/workout/ejercicio/demo" as Href)}>
        <GlassSurface radius={16} style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.lava }}>
            Press banca →
          </Text>
        </GlassSurface>
      </Pressable>
    </DetailScaffold>
  );
}
