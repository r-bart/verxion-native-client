/**
 * MeasureDetailScreen — "Detalle de medida": the full story of one body/activity
 * metric. Hero (today's value + period delta + period picker) over the area chart,
 * a 4-up KPI strip (change · máx · mín · objetivo|media), the weekly records list,
 * and a read-only note. Reads `GET /progress/measure/{metric}?period=`. Read-only:
 * logging a measurement is the agent's job, never a write here.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { SegmentedControl } from "@/presentation/_shared/components/SegmentedControl";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { MeasurePeriod } from "@/domain/progress/models/Progress";
import { useProgressMeasure } from "../hooks/useProgressMeasure";
import { metricVisual, metricLabelKey, TONE_COLOR } from "../lib/metricVisual";
import { formatValue, formatDelta } from "../lib/format";
import { MeasureChart } from "../components/MeasureChart";
import { MeasureRecordRow } from "../components/MeasureRecordRow";

const PERIODS: MeasurePeriod[] = ["mes", "trim", "ano"];

function KpiCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.4, color: glass.ink3 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function MeasureDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { metric: metricParam } = useLocalSearchParams<{ metric: string }>();
  const metric = metricParam ?? "peso";
  const [period, setPeriod] = useState<MeasurePeriod>("mes");

  const { data, isLoading, isError, refetch } = useProgressMeasure(metric, period);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const visual = metricVisual(metric);
  const tone = TONE_COLOR[visual.tone];
  const Icon = visual.icon;
  const label = t(metricLabelKey(metric));
  // card inset: screen padding 16*2 + card padding 16*2
  const chartW = width - 32 - 32;

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
          >
            <GlassSurface radius={19} style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
          <Text style={{ flex: 1, fontFamily: sans(700), fontSize: 19, color: glass.white, letterSpacing: -0.4 }} numberOfLines={1}>
            {label}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={glass.ink2} />
          </View>
        ) : isError || !data ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
              {t("common.somethingWentWrong")}
            </Text>
            <Pressable onPress={() => refetch()} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
              <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
                <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("common.retry")}</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<GlassRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {(() => {
              const delta = formatDelta(data.window.delta, data.unit, data.dec, data.goodDown, t("progress.states.stable"));
              const fourth =
                data.goal != null
                  ? { label: t("progress.measure.goal"), value: formatValue(data.goal, data.unit, data.dec) }
                  : {
                      label: t("progress.measure.average"),
                      value:
                        data.window.max != null && data.window.min != null
                          ? formatValue((data.window.max + data.window.min) / 2, data.unit, data.dec)
                          : "—",
                    };
              const recVals = data.records.map((r) => r.value);
              const recMin = recVals.length ? Math.min(...recVals) : 0;
              const recMax = recVals.length ? Math.max(...recVals) : 1;
              const recSpan = recMax - recMin || 1;

              return (
                <>
                  <GlassSurface radius={18} style={{ padding: 16, gap: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <IconBubble bg={tone.tint} size={36}>
                        <Icon size={18} color={tone.ink} strokeWidth={2} />
                      </IconBubble>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.5, color: glass.ink3 }}>
                          {t("progress.measure.today").toUpperCase()}
                        </Text>
                        <Text style={{ fontFamily: sans(700), fontSize: 27, letterSpacing: -1, color: tone.ink }}>
                          {formatValue(data.window.now, data.unit, data.dec)}
                        </Text>
                      </View>
                      <Chip tone={delta.tone} label={delta.text} />
                    </View>

                    <SegmentedControl
                      options={PERIODS.map((p) => ({ key: p, label: t(`progress.measure.period.${p}`) }))}
                      value={period}
                      onChange={setPeriod}
                    />

                    <MeasureChart
                      values={data.chart.map((c) => c.value)}
                      color={tone.ink}
                      goal={data.goal}
                      width={chartW}
                    />
                  </GlassSurface>

                  <GlassSurface radius={18} style={{ padding: 16, flexDirection: "row" }}>
                    <KpiCell label={t("progress.measure.change")} value={delta.text} />
                    <KpiCell label={t("progress.measure.max")} value={formatValue(data.window.max, data.unit, data.dec)} />
                    <KpiCell label={t("progress.measure.min")} value={formatValue(data.window.min, data.unit, data.dec)} />
                    <KpiCell label={fourth.label} value={fourth.value} />
                  </GlassSurface>

                  {data.records.length > 0 && (
                    <GlassSurface radius={18} style={{ padding: 16, paddingVertical: 8 }}>
                      {data.records.map((r, i) => (
                        <MeasureRecordRow
                          key={`${r.date}-${i}`}
                          date={r.date}
                          value={r.value}
                          deltaPrev={r.deltaPrev}
                          unit={data.unit}
                          dec={data.dec}
                          goodDown={data.goodDown}
                          frac={(r.value - recMin) / recSpan}
                          tint={tone.ink}
                        />
                      ))}
                    </GlassSurface>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, paddingTop: 4 }}>
                    <Lock size={13} color={glass.ink3} strokeWidth={2} />
                    <Text style={{ flex: 1, fontFamily: mono(400), fontSize: 11, lineHeight: 16, color: glass.ink3 }}>
                      {t("progress.measure.readOnly")}
                    </Text>
                  </View>
                </>
              );
            })()}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
