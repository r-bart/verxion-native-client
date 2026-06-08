/**
 * SkeletonBlock — the canonical loading placeholder. A muted GlassSurface block
 * that gently pulses (gated by reduced-motion). Replaces the per-file `Block`
 * helpers and the centered ActivityIndicator spinners so every screen loads with
 * a content-shaped silhouette in the same glass language. The pulse runs only in
 * an effect, never in the render body (Reanimated rule, CLAUDE.md).
 */
import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";

type Props = {
  /** Block height in px. */
  height: number;
  /** Optional fixed width (defaults to the full width of the parent slot). */
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({ height, width, radius = 16, style }: Props) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      false
    );
  }, [opacity, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[width != null ? { width } : null, animatedStyle]}>
      <GlassSurface radius={radius} style={[{ height }, style]} />
    </Animated.View>
  );
}
