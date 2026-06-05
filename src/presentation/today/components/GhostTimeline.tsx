/**
 * GhostTimeline — the "Tu día" spine while the day is still empty, animated as a
 * looping little story of the day writing itself:
 *   1. the spine unfolds top → bottom (rows reveal staggered downward),
 *   2. each row slides in from the right as it appears,
 *   3. once in, each row tints to a low-opacity lava red — "logged" —
 *   then the whole thing fades and the loop restarts.
 * Honest by design: labels are skeleton bars, not fabricated content. Respects
 * reduced-motion (renders static, mid-state, no animation).
 */
import { View, Text } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Utensils, Dumbbell, Droplet, Pill, Footprints, type LucideProps } from "lucide-react-native";
import { useEffect, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SectionLabel } from "./SectionLabel";

const TIME_W = 46;
const NODE = 18;
const ROW_H = 42;
const CYCLE_MS = 6000;

// Palette for the ghost ↔ logged transition.
const BAR_GHOST = "rgba(255,255,255,0.085)";
const BAR_LOGGED = "rgba(255,98,98,0.32)"; // lava @ low opacity
const NODE_BG_LOGGED = "rgba(255,98,98,0.24)";

// Evocative day shapes — icon + skeleton-bar width fraction (no fake text).
const GHOST_ROWS: { Icon: ComponentType<LucideProps>; w: number }[] = [
  { Icon: Droplet, w: 0.4 },
  { Icon: Utensils, w: 0.64 },
  { Icon: Dumbbell, w: 0.52 },
  { Icon: Pill, w: 0.36 },
  { Icon: Footprints, w: 0.48 },
];

// Gap-aware spine segment length so the line meets the node edge, never crosses it.
const SPINE_SEG = ROW_H / 2 - NODE / 2 - 1.5;

function clamp01(v: number): number {
  "worklet";
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Back-out overshoot easing — gives each element a subtle spring as it settles.
function backOut(t: number): number {
  "worklet";
  const s = 1.7;
  const p = clamp01(t) - 1;
  return 1 + (s + 1) * p * p * p + s * p * p;
}

function GhostRow({
  Icon,
  w,
  index,
  phase,
  reduced,
  first,
  last,
}: {
  Icon: ComponentType<LucideProps>;
  w: number;
  index: number;
  phase: SharedValue<number>;
  reduced: boolean;
  first: boolean;
  last: boolean;
}) {
  // Normalized keyframes within the [0,1] cycle: appear (staggered top→bottom),
  // then settle into "logged", hold, then a global fade before the loop wraps.
  const appearAt = 0.04 + index * 0.11;
  const logAt = appearAt + 0.18;

  // Row container: reveal (opacity) + the final fade-out. No horizontal move here
  // so the spine/node stay put while only the content slides in (below).
  const rowStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: 0.34 };
    const appear = clamp01((phase.value - appearAt) / 0.13);
    const fade = clamp01((phase.value - 0.9) / 0.08);
    return { opacity: appear * (1 - fade) };
  });

  // The [icon + bar] group springs in from the left as the row appears.
  const contentStyle = useAnimatedStyle(() => {
    if (reduced) return { transform: [{ translateX: 0 }] };
    const e = backOut(clamp01((phase.value - appearAt) / 0.13));
    return { transform: [{ translateX: (1 - e) * -22 }] };
  });

  const barStyle = useAnimatedStyle(() => {
    const logged = reduced ? 0.5 : clamp01((phase.value - logAt) / 0.14);
    return { backgroundColor: interpolateColor(logged, [0, 1], [BAR_GHOST, BAR_LOGGED]) };
  });

  const nodeStyle = useAnimatedStyle(() => {
    const logged = reduced ? 0.5 : clamp01((phase.value - logAt) / 0.14);
    const pop = reduced ? 1 : backOut(clamp01((phase.value - appearAt) / 0.13));
    return {
      backgroundColor: interpolateColor(logged, [0, 1], ["rgba(255,98,98,0)", NODE_BG_LOGGED]),
      borderColor: interpolateColor(logged, [0, 1], [glass.ink3, glass.lava]),
      transform: [{ scale: 0.4 + pop * 0.6 }],
    };
  });

  return (
    <Animated.View style={[{ flexDirection: "row", gap: 12, alignItems: "center", height: ROW_H }, rowStyle]}>
      <View style={{ width: TIME_W }} />
      <View style={{ width: NODE, height: ROW_H, alignItems: "center", justifyContent: "center" }}>
        {/* Spine split into top/bottom segments with a gap around the node, so
            the line meets the circle's edge instead of crossing through it. */}
        {!first && (
          <View style={{ position: "absolute", top: 0, height: SPINE_SEG, width: 1.5, backgroundColor: glass.stroke }} />
        )}
        {!last && (
          <View style={{ position: "absolute", bottom: 0, height: SPINE_SEG, width: 1.5, backgroundColor: glass.stroke }} />
        )}
        <Animated.View
          style={[
            { width: NODE, height: NODE, borderRadius: 9999, borderWidth: 1.5 },
            nodeStyle,
          ]}
        />
      </View>
      <Animated.View style={[{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }, contentStyle]}>
        <Icon size={15} color={glass.ink2} strokeWidth={2} />
        <Animated.View style={[{ height: 9, borderRadius: 6, width: `${w * 100}%` }, barStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

export function GhostTimeline() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    phase.value = withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }), -1, false);
  }, [reduced, phase]);

  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>{t("today.yourDay")}</SectionLabel>
      <View>
        {GHOST_ROWS.map((r, i) => (
          <GhostRow
            key={i}
            Icon={r.Icon}
            w={r.w}
            index={i}
            phase={phase}
            reduced={reduced}
            first={i === 0}
            last={i === GHOST_ROWS.length - 1}
          />
        ))}
      </View>
      <Text
        style={{
          fontFamily: sans(400),
          fontSize: 12,
          lineHeight: 17,
          color: glass.ink3,
          paddingLeft: TIME_W + 12 + NODE + 12,
          paddingTop: 2,
        }}
      >
        {t("today.empty.ghostHint")}
      </Text>
    </View>
  );
}
