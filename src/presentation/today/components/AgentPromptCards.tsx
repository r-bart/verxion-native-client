/**
 * AgentPromptCards — "Try asking your agent" (handoff scenario B): a battery of
 * real, copyable example prompts. Each category card (routine / diet / program)
 * slowly cycles through several example phrasings with an elegant crossfade, so
 * the empty state breathes and hints at the breadth of what you can ask. Tapping
 * copies the *currently shown* prompt to the clipboard — the concrete, shippable
 * action while the Agente tab is still Coming Soon.
 *
 * NOTE: copy uses expo-clipboard (a native module). The call is guarded — it
 * silently no-ops on a dev client built before it was added, never throwing.
 */
import { useEffect, useRef, useState, type ComponentType } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Copy, Check, Dumbbell, Leaf, Layers, type LucideProps } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";
import { SectionLabel } from "./SectionLabel";

const PROMPTS: { key: "routine" | "diet" | "program"; Icon: ComponentType<LucideProps> }[] = [
  { key: "routine", Icon: Dumbbell },
  { key: "diet", Icon: Leaf },
  { key: "program", Icon: Layers },
];

const CYCLE_MS = 4200; // dwell time per prompt
const STAGGER_MS = 1400; // offset between cards so they don't flip in unison
const TEXT_MIN_H = 54; // ~3 lines — fixed so cycling never reflows the card

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Dynamic import so a missing native module (dev client not yet rebuilt with
    // expo-clipboard) is caught here instead of crashing at module eval.
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * CopyCheck — the trailing affordance. Copy and Check are stacked and crossfade
 * with a spring (scale + a quarter rotation), so confirming a copy feels like a
 * tactile flip rather than an instant icon swap.
 */
function CopyCheck({ copied }: { copied: boolean }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withSpring(copied ? 1 : 0, { damping: 13, stiffness: 190, mass: 0.6 });
  }, [copied, p]);

  const copyStyle = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ scale: 1 - p.value * 0.35 }, { rotate: `${-90 * p.value}deg` }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.5 + p.value * 0.5 }, { rotate: `${90 * (1 - p.value)}deg` }],
  }));

  return (
    <View style={{ width: 16, height: 16, marginTop: 1 }}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, copyStyle]}>
        <Copy size={15} color={glass.ink3} strokeWidth={2} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, checkStyle]}>
        <Check size={15} color={glass.up} strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
}

function PromptCard({
  Icon,
  variants,
  offset,
  reduced,
}: {
  Icon: ComponentType<LucideProps>;
  variants: string[];
  offset: number;
  reduced: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const pausedRef = useRef(false); // hold the cycle while a "copied" state is showing

  const opacity = useSharedValue(1);
  const ty = useSharedValue(0);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  useEffect(() => {
    if (reduced || variants.length <= 1) return;
    let alive = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const bump = () => setIdx((i) => (i + 1) % variants.length);

    // One crossfade per tick: the current phrasing eases up + out, the text is
    // swapped at the trough (opacity 0), then the next phrasing rises in from
    // below. All animation lives here so shared values are never mutated from a
    // render-path callback (React Compiler immutability).
    const tick = () => {
      if (!alive || pausedRef.current) return;
      opacity.value = withSequence(
        withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }, (fin) => {
          "worklet";
          if (fin) runOnJS(bump)();
        }),
        withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) })
      );
      ty.value = withSequence(
        withTiming(-7, { duration: 300, easing: Easing.in(Easing.cubic) }),
        withTiming(7, { duration: 0 }),
        withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) })
      );
    };

    const timeout = setTimeout(() => {
      if (alive) interval = setInterval(tick, CYCLE_MS);
    }, offset);

    return () => {
      alive = false;
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [reduced, variants.length, offset, opacity, ty]);

  const onPress = async () => {
    const ok = await copyToClipboard(variants[idx]);
    if (!ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    pausedRef.current = true;
    setCopied(true);
    setTimeout(() => {
      pausedRef.current = false;
      setCopied(false);
    }, 1700);
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <GlassSurface radius={14} style={{ padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
        <Icon size={16} color={glass.lava} strokeWidth={2} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, minHeight: TEXT_MIN_H, justifyContent: "center" }}>
          <Animated.Text
            style={[
              { fontFamily: mono(400), fontSize: 12.5, lineHeight: 18, color: glass.ink },
              reduced ? undefined : textStyle,
            ]}
          >
            {variants[idx]}
          </Animated.Text>
        </View>
        <CopyCheck copied={copied} />
      </GlassSurface>
    </Pressable>
  );
}

export function AgentPromptCards() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  return (
    <View style={{ gap: 11 }}>
      <SectionLabel>{t("today.empty.promptsLabel")}</SectionLabel>
      {PROMPTS.map(({ key, Icon }, i) => {
        const variants = t(`today.empty.prompts.${key}`, { returnObjects: true }) as unknown as string[];
        return (
          <PromptCard
            key={key}
            Icon={Icon}
            variants={Array.isArray(variants) ? variants : [String(variants)]}
            offset={i * STAGGER_MS}
            reduced={reduced}
          />
        );
      })}
      <Text style={{ fontFamily: mono(500), fontSize: 10.5, color: glass.ink3, paddingTop: 1 }}>
        {t("today.empty.copyHint")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
