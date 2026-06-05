/**
 * ScreenBloom — the app's background: a near-black base with a lava bloom up
 * top, a faint purple bloom top-right, and a soft lava bloom at the bottom.
 * The handoff CSS used radial-gradients; RN has none, so we paint it with Skia
 * (cheap, single canvas). Ported from the design handoff.
 */
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Rect, RadialGradient, vec } from "@shopify/react-native-skia";
import { glass } from "@/presentation/_shared/design/glass";

export function ScreenBloom() {
  const { width: w, height: h } = useWindowDimensions();
  const maxR = Math.max(w, h);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={w} height={h} color={glass.screenBg} />
      {/* top lava bloom */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient c={vec(w * 0.5, -h * 0.04)} r={maxR * 0.62} colors={["rgba(255,98,98,0.26)", "rgba(255,98,98,0)"]} />
      </Rect>
      {/* top-right purple bloom */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient c={vec(w * 0.92, h * 0.14)} r={maxR * 0.42} colors={["rgba(155,89,182,0.16)", "rgba(155,89,182,0)"]} />
      </Rect>
      {/* bottom lava bloom */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient c={vec(w * 0.5, h * 1.04)} r={maxR * 0.5} colors={["rgba(255,98,98,0.1)", "rgba(255,98,98,0)"]} />
      </Rect>
    </Canvas>
  );
}
