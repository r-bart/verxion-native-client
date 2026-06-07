/**
 * MacroLine — the shared "kcal · P/C/G" macro readout used across the Nutrición
 * detail surfaces. Colours follow the app macro vocabulary (P lava, C body/cyan,
 * F neutral/amber). Single-sourced so every meal/food row reads identically.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import type { MacroSet } from "@/domain/nutrition/models/NutritionDashboard";

export function MacroLine({ macros, size = 11.5 }: { macros: MacroSet; size?: number }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
      <Text style={{ fontFamily: mono(500), fontSize: size, color: glass.ink2 }}>
        {t("nutrition.dietDetail.kcal", { kcal: nInt(macros.kcal) })}
      </Text>
      <Text style={{ fontFamily: mono(400), fontSize: size, color: glass.ink3 }}>·</Text>
      <Text style={{ fontFamily: mono(600), fontSize: size, color: glass.lava }}>
        {nInt(macros.protein)}P
      </Text>
      <Text style={{ fontFamily: mono(600), fontSize: size, color: palette.body.text }}>
        {nInt(macros.carbs)}C
      </Text>
      <Text style={{ fontFamily: mono(600), fontSize: size, color: palette.neutral.text }}>
        {nInt(macros.fat)}G
      </Text>
    </View>
  );
}
