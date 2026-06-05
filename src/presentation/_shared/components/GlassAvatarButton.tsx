/**
 * GlassAvatarButton — the liquid-glass sphere in the header (top-right) showing
 * the user's initials. It is the entry point to Settings. Real glass on iOS 26+
 * (via GlassSurface), translucent fallback elsewhere.
 */
import { Text, Pressable } from "react-native";
import { GlassSurface } from "./GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  initials: string;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
};

export function GlassAvatarButton({ initials, onPress, accessibilityLabel, size = 38 }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID="open-settings">
      {({ pressed }) => (
        <GlassSurface
          radius={9999}
          interactive
          style={{
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? glass.pressOpacity : 1,
          }}
        >
          <Text style={{ fontFamily: sans(700), fontSize: size * 0.38, color: glass.white }}>{initials}</Text>
        </GlassSurface>
      )}
    </Pressable>
  );
}
