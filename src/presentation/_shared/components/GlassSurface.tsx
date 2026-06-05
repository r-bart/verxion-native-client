/**
 * GlassSurface — the one place the "liquid glass" decision lives. Uses Apple's
 * native Liquid Glass (expo-glass-effect, iOS 26+) when available; otherwise
 * falls back to a static translucent fill + hairline border (the handoff's
 * `--glass-fill` / `--glass-stroke` look). Ported from the design handoff.
 */
import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { glass } from "@/presentation/_shared/design/glass";

const NATIVE_GLASS = isLiquidGlassAvailable();

type Props = ViewProps & {
  radius?: number;
  /** Native glass appearance when available. */
  glassStyle?: "regular" | "clear";
  tintColor?: string;
  interactive?: boolean;
  /** Fallback fill when native glass is unavailable. */
  fallbackFill?: string;
  /** Draw the hairline border on the fallback (off for seamless surfaces). */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassSurface({
  radius = 20,
  glassStyle = "regular",
  tintColor,
  interactive = false,
  fallbackFill = glass.fill,
  bordered = true,
  style,
  children,
  ...rest
}: Props) {
  if (NATIVE_GLASS) {
    return (
      <GlassView
        glassEffectStyle={glassStyle}
        tintColor={tintColor}
        isInteractive={interactive}
        colorScheme="dark"
        style={[{ borderRadius: radius, overflow: "hidden" }, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: fallbackFill,
          overflow: "hidden",
          ...(bordered ? { borderWidth: 1, borderColor: glass.stroke } : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
