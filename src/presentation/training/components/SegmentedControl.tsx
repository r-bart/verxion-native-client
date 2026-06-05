/**
 * SegmentedControl — the pill selector with a sliding thumb used at the top of
 * the Entreno landing (Rutina · Sesiones · Ejercicios). The handoff animates a
 * `left`/`width` thumb; here the thumb is an absolutely-positioned glass layer
 * driven by Reanimated (gated by reduced-motion). Generic over the option key
 * so callers stay type-safe.
 */
import { useCallback, useEffect, useState } from "react";
import { View, Pressable, Text, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { glass } from "@/presentation/_shared/design/glass";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { sans } from "@/presentation/_shared/design/fonts";

export type SegmentOption<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  options: SegmentOption<K>[];
  value: K;
  onChange: (key: K) => void;
};

const PAD = 4;
// Dry, snappy slide — mirrors the handoff's `.22s` thumb transition.
const TIMING = { duration: 220, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };

export function SegmentedControl<K extends string>({ options, value, onChange }: Props<K>) {
  const [trackW, setTrackW] = useState(0);
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const segW = trackW > 0 ? (trackW - PAD * 2) / options.length : 0;

  const x = useSharedValue(0);
  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  }, []);

  // Keep the thumb in sync with the selected index / measured width. Driving
  // the shared value from an effect (not the render body) is the project's
  // Reanimated convention — render-body writes re-fire the timing every render.
  useEffect(() => {
    if (segW <= 0) return;
    const target = PAD + index * segW;
    x.value = reduceMotion ? target : withTiming(target, TIMING);
  }, [index, segW, reduceMotion, x]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: segW,
  }));

  return (
    <View
      onLayout={onTrackLayout}
      style={{
        flexDirection: "row",
        backgroundColor: glass.tabFill,
        borderRadius: 9999,
        padding: PAD,
        borderWidth: 1,
        borderColor: glass.stroke,
      }}
    >
      {segW > 0 && (
        <Animated.View style={[{ position: "absolute", top: PAD, bottom: PAD }, thumbStyle]}>
          <GlassSurface radius={9999} style={{ flex: 1 }} fallbackFill={glass.fill2} />
        </Animated.View>
      )}
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={{
                fontFamily: sans(active ? 600 : 500),
                fontSize: 13,
                color: active ? glass.white : glass.ink2,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
