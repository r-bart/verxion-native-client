import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Sticky footer (e.g. a save/discard bar) pinned below the scroll area. */
  footer?: React.ReactNode;
};

/**
 * Shared chrome for every settings screen: glass bloom background, a back
 * button + title header, a scrollable body, and an optional pinned footer.
 * The back button keeps the `settings-back` testID across screens.
 */
export function SettingsScaffold({ title, subtitle, children, footer }: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  // Settings is pushed over the tab bar, so back normally pops within this
  // stack (subscreen → hub) or dismisses it (hub → tabs). But when settings is
  // the only route on the stack — a dev reload that lands on /settings, or a
  // deep link straight into it — there is nothing to pop and `router.back()`
  // throws "GO_BACK was not handled". Fall back to the home tab in that case.
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/today");
  };

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            testID="settings-back"
          >
            {({ pressed }) => (
              <GlassSurface
                radius={9999}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? glass.pressOpacity : 1,
                }}
              >
                <ChevronLeft size={20} color={glass.ink} strokeWidth={2} />
              </GlassSurface>
            )}
          </Pressable>
          <Text
            style={{
              fontFamily: sans(800),
              fontSize: 19,
              letterSpacing: -0.4,
              color: glass.white,
            }}
          >
            {title}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {subtitle != null && (
            <Text
              style={{
                fontFamily: mono(400),
                fontSize: 13,
                lineHeight: 19,
                color: glass.ink2,
                marginTop: -4,
              }}
            >
              {subtitle}
            </Text>
          )}
          {children}
        </ScrollView>

        {footer != null && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
            {footer}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
