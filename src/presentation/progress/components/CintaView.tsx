/**
 * CintaView — the Cinta (overview): the 3 domains (peso/volumen/adherencia) laid
 * over one week axis and scrubbed together. A cross-domain readout up top, the 3
 * Skia lanes sharing a white playhead, "jump to" chips per PR milestone, and the
 * phase summary where the scrub falls. Scrub is the RN responder system (discrete
 * week snapping) — no extra gesture dep, no animated shared value.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Maximize2, ChevronLeft } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgressHistory, HistorySeries } from "@/domain/progress/models/Progress";
import { metricVisual, metricLabelKey, TONE_COLOR } from "../lib/metricVisual";
import { formatNumber } from "../lib/format";
import { bandAtWeek, lastKnownValueAtWeek, weeksAgo, fillForward } from "../lib/history";
import { HistoryLane } from "./HistoryLane";

/** Renders a series' displayed value (last-known, carried forward) with its unit. */
function laneValue(s: HistorySeries, week: number): string {
  const v = lastKnownValueAtWeek(s, week);
  if (v == null) return "—";
  return `${formatNumber(v, s.key === "adherencia" ? 0 : 1)}${s.unit ? ` ${s.unit}` : ""}`;
}

export function CintaView({ history }: { history: ProgressHistory }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const lastWeek = Math.max(0, history.weeks - 1);
  const [scrub, setScrub] = useState(lastWeek);
  const [laneW, setLaneW] = useState(0);
  // Focus mode: one domain blown up. Scrub is shared, so it survives enter/exit.
  const [focus, setFocus] = useState<string | null>(null);
  const focused = focus ? (history.series.find((s) => s.key === focus) ?? null) : null;

  const majorBand = useMemo(() => history.bands.find((b) => b.isMajor) ?? null, [history.bands]);
  const splitFrac = majorBand && lastWeek > 0 ? majorBand.fromWeek / lastWeek : null;
  const band = bandAtWeek(history.bands, scrub);
  const isToday = scrub === lastWeek;

  const onLayout = (e: LayoutChangeEvent) => setLaneW(e.nativeEvent.layout.width);
  const scrubToX = (x: number) => {
    if (laneW <= 0 || lastWeek === 0) return;
    const next = Math.round(Math.max(0, Math.min(1, x / laneW)) * lastWeek);
    setScrub((cur) => (cur === next ? cur : next));
  };
  // Horizontal-only pan: `activeOffsetX` claims the gesture on a sideways drag and
  // `failOffsetY` yields a vertical drag to the parent ScrollView, so the lanes
  // scrub WITHOUT trapping the page scroll. Snaps to the nearest week.
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onStart((e) => runOnJS(scrubToX)(e.x))
    .onUpdate((e) => runOnJS(scrubToX)(e.x));

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 64, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cross-domain readout at the scrub instant */}
      <GlassSurface radius={18} style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: mono(500), fontSize: 10, letterSpacing: 0.8, color: glass.ink3 }}>
            {isToday ? t("progress.historial.youNow") : t("progress.historial.youThen")}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>
            {isToday ? t("progress.historial.thisWeek") : t("progress.historial.weeksAgo", { n: weeksAgo(scrub, history.weeks) })}
          </Text>
        </View>
        {focused ? (
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.3, color: TONE_COLOR[metricVisual(focused.key).tone].ink }}>
              {t(metricLabelKey(focused.key)).toUpperCase()}
            </Text>
            <Text style={{ fontFamily: sans(700), fontSize: 30, letterSpacing: -1, color: glass.white }}>
              {laneValue(focused, scrub)}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {history.series.map((s) => {
              const tone = TONE_COLOR[metricVisual(s.key).tone];
              return (
                <View key={s.key} style={{ gap: 2 }}>
                  <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.3, color: tone.ink }}>
                    {t(metricLabelKey(s.key)).toUpperCase()}
                  </Text>
                  <Text style={{ fontFamily: sans(700), fontSize: 18, color: glass.white }}>
                    {laneValue(s, scrub)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        {band && (
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Chip tone="neutral" label={band.name} />
          </View>
        )}
      </GlassSurface>

      {/* Lanes (shared scrub) — focus = one domain blown up, else the 3 stacked */}
      {focused ? (
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => setFocus(null)}
            accessibilityRole="button"
            accessibilityLabel={t("progress.historial.allDomains")}
            hitSlop={8}
            style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? glass.pressOpacity : 1 })}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 7,
                paddingLeft: 8,
                paddingRight: 12,
                borderRadius: 9999,
                backgroundColor: glass.fill2,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: glass.stroke,
              }}
            >
              <ChevronLeft size={15} color={glass.ink} strokeWidth={2.5} />
              <Text style={{ fontFamily: sans(600), fontSize: 12, color: glass.ink }}>
                {t("progress.historial.allDomains")}
              </Text>
            </View>
          </Pressable>
          <GestureDetector gesture={pan}>
            <View onLayout={onLayout}>
              <GlassSurface radius={18} style={{ padding: 14, gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: sans(600), fontSize: 13, letterSpacing: 0.2, color: TONE_COLOR[metricVisual(focused.key).tone].ink }}>
                    {t(metricLabelKey(focused.key)).toUpperCase()}
                  </Text>
                  <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>{laneValue(focused, scrub)}</Text>
                </View>
                {laneW > 0 && (
                  <HistoryLane
                    points={fillForward(focused.points.map((p) => p.value))}
                    color={TONE_COLOR[metricVisual(focused.key).tone].ink}
                    width={laneW - 28}
                    height={150}
                    scrubIndex={scrub}
                    splitFrac={splitFrac}
                  />
                )}
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 2 }}>
                  {[0, Math.round(lastWeek / 2), lastWeek].map((w, i) => (
                    <Text key={i} style={{ fontFamily: mono(400), fontSize: 9, color: glass.ink3 }}>
                      {w === lastWeek ? t("progress.historial.axisNow") : t("progress.historial.weeksAgo", { n: weeksAgo(w, history.weeks) })}
                    </Text>
                  ))}
                </View>
              </GlassSurface>
            </View>
          </GestureDetector>
          <Text style={{ fontFamily: mono(400), fontSize: 10, color: glass.ink3, paddingHorizontal: 4 }}>
            {t("progress.historial.focusHint")}
          </Text>
        </View>
      ) : (
        <GestureDetector gesture={pan}>
          <View onLayout={onLayout} style={{ gap: 14 }}>
            {history.series.map((s) => {
              const tone = TONE_COLOR[metricVisual(s.key).tone];
              const points = fillForward(s.points.map((p) => p.value));
              return (
                <GlassSurface key={s.key} radius={16} style={{ padding: 12, gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: sans(600), fontSize: 12, letterSpacing: 0.2, color: tone.ink }}>
                      {t(metricLabelKey(s.key)).toUpperCase()}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text style={{ fontFamily: sans(700), fontSize: 13, color: glass.white }}>{laneValue(s, scrub)}</Text>
                      <Pressable
                        onPress={() => setFocus(s.key)}
                        accessibilityRole="button"
                        accessibilityLabel={t("progress.historial.focus")}
                        hitSlop={10}
                        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
                      >
                        <Maximize2 size={14} color={glass.ink3} strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>
                  {laneW > 0 && (
                    <HistoryLane points={points} color={tone.ink} width={laneW - 24} scrubIndex={scrub} splitFrac={splitFrac} />
                  )}
                </GlassSurface>
              );
            })}
          </View>
        </GestureDetector>
      )}

      {/* Phase summary where the scrub falls */}
      {band && (
        <GlassSurface radius={16} style={{ padding: 14, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Chip tone="neutral" label={band.name} />
            <Text style={{ fontFamily: mono(400), fontSize: 10, color: glass.ink3 }}>
              {t("progress.historial.weekRange", { from: band.fromWeek, to: band.toWeek })}
            </Text>
          </View>
          {band.why != null && (
            <Text style={{ fontFamily: mono(400), fontSize: 12, lineHeight: 18, color: glass.ink2 }}>{band.why}</Text>
          )}
        </GlassSurface>
      )}
    </ScrollView>
  );
}
