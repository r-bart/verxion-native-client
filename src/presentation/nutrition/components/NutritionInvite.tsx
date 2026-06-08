/**
 * NutritionInvite — the cold-start state of the Plan segment. `empty` ("Sin
 * dieta") invites the user to ask the agent for their first diet; `fresh`
 * ("Recién") greets a brand-new diet. Both route to the agent — this is a
 * read-only client; diets are built and activated by verxion. Mirrors the
 * handoff's `NEmptyInvite`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { DietState } from "@/domain/nutrition/models/NutritionDashboard";

export function NutritionInvite({ state }: { state: DietState }) {
  const { t } = useTranslation();
  const router = useRouter();
  const variant = state === "fresh" ? "fresh" : "empty";

  return (
    <GlassSurface
      radius={20}
      style={{ padding: 24, alignItems: "center", gap: 14 }}
    >
      <Isotype size={48} glow />
      <Text
        style={{
          fontFamily: sans(700),
          fontSize: 19,
          color: glass.white,
          textAlign: "center",
          letterSpacing: -0.3,
        }}
      >
        {t(`nutrition.invite.${variant}.title`)}
      </Text>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 13,
          lineHeight: 20,
          color: glass.ink2,
          textAlign: "center",
        }}
      >
        {t(`nutrition.invite.${variant}.body`)}
      </Text>
      {/* width lives on the Pressable's STATIC style (a layout value returned
          from the ({pressed}) callback doesn't size the slot — see CLAUDE.md);
          press opacity moves to the inner View via the render-function form. */}
      <Pressable
        onPress={() => router.push("/agent")}
        accessibilityRole="button"
        style={{ width: "100%" }}
      >
        {({ pressed }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderRadius: 14,
              backgroundColor: glass.lavaBg,
              borderWidth: 1,
              borderColor: glass.lavaBorder,
              opacity: pressed ? glass.pressOpacity : 1,
            }}
          >
            <Text
              style={{ fontFamily: sans(700), fontSize: 16, color: glass.lava }}
            >
              ›
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: mono(400),
                fontSize: 12.5,
                color: glass.ink,
                lineHeight: 18,
              }}
            >
              {t("nutrition.invite.prompt")}
            </Text>
          </View>
        )}
      </Pressable>
    </GlassSurface>
  );
}
