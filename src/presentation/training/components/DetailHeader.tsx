/**
 * DetailHeader — the sticky chrome for Entreno detail screens: a circular glass
 * back button, a centered title, and an optional right slot (a "···" action or
 * a spacer to keep the title centered). The handoff used `position: sticky`; in
 * the native stack each detail screen renders this at the top of its content
 * and the stack owns the push/pop, so `onBack` defaults to `router.back()`.
 */
import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

const CIRCLE = 40;

export function DetailHeader({ title, onBack, right }: Props) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
      }}
    >
      <Pressable
        onPress={back}
        accessibilityRole="button"
        accessibilityLabel="back"
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <GlassSurface
          radius={CIRCLE / 2}
          style={{ width: CIRCLE, height: CIRCLE, alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
        </GlassSurface>
      </Pressable>

      {title ? (
        <Text
          numberOfLines={1}
          style={{ flex: 1, textAlign: "center", fontFamily: sans(600), fontSize: 16, color: glass.white }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={{ width: CIRCLE, height: CIRCLE, alignItems: "center", justifyContent: "center" }}>
        {right}
      </View>
    </View>
  );
}
