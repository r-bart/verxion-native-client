/**
 * WipBody — the Phase-0 placeholder body. Each Entreno screen renders its real
 * content here phase by phase; for now it states the screen and any resolved
 * route params so the navigation skeleton is visibly wired end to end. Delete
 * per screen as the real composition lands.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { mono, sans } from "@/presentation/_shared/design/fonts";

export function WipBody({ screen, params }: { screen: string; params?: Record<string, string | undefined> }) {
  const { t } = useTranslation();
  const entries = Object.entries(params ?? {}).filter(([, v]) => v != null);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 22, color: glass.white, letterSpacing: -0.4 }}>
        {screen}
      </Text>
      <Text
        style={{
          fontFamily: mono(500),
          fontSize: 11,
          letterSpacing: 0.8,
          color: glass.lava,
          textTransform: "uppercase",
        }}
      >
        {t("training.wip")}
      </Text>
      {entries.length > 0 && (
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink3, textAlign: "center" }}>
          {entries.map(([k, v]) => `${k}: ${v}`).join("  ·  ")}
        </Text>
      )}
    </View>
  );
}
