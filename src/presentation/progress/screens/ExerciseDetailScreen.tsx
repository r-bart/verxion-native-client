/**
 * ExerciseDetailScreen — "Detalle de ejercicio": the whole history of one
 * movement. Hero (part bubble + name + category) over a KPI strip, then two tabs:
 * Progreso (metric toggle e1RM↔volumen, record value + delta, the Skia curve,
 * per-session history, muscle involvement) and Cómo se hace (the exercise-library
 * guide — instructions + chips, fetched cross-module by the read-model's `id`).
 * Read-only: editing the exercise is a request to the agent, never a write.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Dumbbell, Sparkles, Lock } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { SegmentedControl } from "@/presentation/_shared/components/SegmentedControl";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ExerciseMetric } from "@/domain/progress/models/Progress";
import { useProgressExerciseDetail } from "../hooks/useProgressExerciseDetail";
import { useExerciseGuide } from "../hooks/useExerciseGuide";
import { formatNumber, formatValue } from "../lib/format";
import { MeasureChart } from "../components/MeasureChart";
import { ExerciseHistoryRow } from "../components/ExerciseHistoryRow";
import { MuscleBar } from "../components/MuscleBar";

const PART_TINT: Record<string, { ink: string; tint: string }> = {
  push: { ink: glass.lava, tint: glass.lavaBg },
  pull: { ink: palette.body.primary, tint: palette.body.background },
  legs: { ink: palette.neutral.primary, tint: palette.neutral.background },
  core: { ink: palette.insight.primary, tint: palette.insight.background },
};
const PART_FALLBACK = { ink: glass.lava, tint: glass.lavaBg };

function KpiCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.4, color: glass.ink3 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: accent ?? glass.white }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Header({ title }: { title: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
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
        {title}
      </Text>
    </View>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
        {t("common.somethingWentWrong")}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
        <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("common.retry")}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export function ExerciseDetailScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = slugParam ?? "";
  const [tab, setTab] = useState<"progress" | "guide">("progress");
  const [metric, setMetric] = useState<ExerciseMetric>("e1rm");

  const { data, isLoading, isError, refetch } = useProgressExerciseDetail(slug, metric);
  const guide = useExerciseGuide(data?.id, tab === "guide");
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const chartW = width - 32 - 32;

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header title={data?.name ?? ""} />

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={glass.ink2} />
          </View>
        ) : isError || !data ? (
          <ErrorBox onRetry={() => refetch()} />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<GlassRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {(() => {
              const part = PART_TINT[data.part ?? ""] ?? PART_FALLBACK;
              const isE1rm = data.metric === "e1rm";
              const recordValue = isE1rm ? data.kpis.e1rmKg : data.kpis.bestVolumeT;
              const recordUnit = isE1rm ? "kg" : "t";
              const recordDec = isE1rm ? 0 : 1;
              const deltaRaw = isE1rm ? data.e1rmDelta : data.volDelta;
              const deltaText =
                deltaRaw == null || deltaRaw === 0
                  ? null
                  : `${deltaRaw > 0 ? "+" : "−"}${formatNumber(Math.abs(deltaRaw), recordDec)} ${recordUnit}`;

              return (
                <>
                  {/* Hero */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 4 }}>
                    <IconBubble bg={part.tint} size={48} radius={16}>
                      <Dumbbell size={22} color={part.ink} strokeWidth={2} />
                    </IconBubble>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={{ fontFamily: sans(700), fontSize: 22, letterSpacing: -0.6, color: glass.white }}>
                        {data.name}
                      </Text>
                      {data.category != null && (
                        <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>
                          {data.category}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* KPI strip */}
                  <GlassSurface radius={18} style={{ padding: 16, flexDirection: "row" }}>
                    <KpiCell label={t("progress.exercise.kpis.pr")} value={formatValue(data.kpis.prWeightKg, "kg", 1)} accent={part.ink} />
                    <KpiCell label={t("progress.exercise.kpis.e1rm")} value={formatValue(data.kpis.e1rmKg, "kg", 0)} />
                    <KpiCell label={t("progress.exercise.kpis.bestVol")} value={formatValue(data.kpis.bestVolumeT, "t", 1)} />
                    <KpiCell label={t("progress.exercise.kpis.logs")} value={formatNumber(data.kpis.logs, 0)} />
                  </GlassSurface>

                  {/* Tabs */}
                  <SegmentedControl
                    options={[
                      { key: "progress" as const, label: t("progress.exercise.tabs.progress") },
                      { key: "guide" as const, label: t("progress.exercise.tabs.guide") },
                    ]}
                    value={tab}
                    onChange={setTab}
                  />

                  {tab === "progress" ? (
                    data.empty ? (
                      <View style={{ paddingTop: 24 }}>
                        <EmptyState
                          icon={<Sparkles size={28} color={glass.lava} strokeWidth={2} />}
                          title={t("progress.exercise.emptyTitle")}
                          body={t("progress.exercise.emptyBody")}
                        />
                      </View>
                    ) : (
                      <>
                        {/* metric toggle + record */}
                        <GlassSurface radius={18} style={{ padding: 16, gap: 14 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                              <Text style={{ fontFamily: sans(700), fontSize: 27, letterSpacing: -1, color: part.ink }}>
                                {formatValue(recordValue, recordUnit, recordDec)}
                              </Text>
                              {deltaText && <Chip tone="up" label={deltaText} />}
                            </View>
                            <View style={{ width: 168 }}>
                              <SegmentedControl
                                options={[
                                  { key: "e1rm" as const, label: t("progress.exercise.metric.e1rm") },
                                  { key: "volumen" as const, label: t("progress.exercise.metric.volumen") },
                                ]}
                                value={metric}
                                onChange={setMetric}
                              />
                            </View>
                          </View>
                          <MeasureChart values={data.curve.map((c) => c.value)} color={part.ink} width={chartW} />
                        </GlassSurface>

                        {/* history */}
                        {data.history.length > 0 && (
                          <View style={{ gap: 4 }}>
                            <Text style={{ fontFamily: mono(500), fontSize: 11, letterSpacing: 0.6, color: glass.ink3, paddingHorizontal: 4 }}>
                              {t("progress.exercise.history").toUpperCase()}
                            </Text>
                            <GlassSurface radius={18} style={{ padding: 16, paddingVertical: 8 }}>
                              {data.history.map((h, i) => (
                                <ExerciseHistoryRow
                                  key={`${h.date}-${i}`}
                                  date={h.date}
                                  topSetWeightKg={h.topSetWeightKg}
                                  topSetReps={h.topSetReps}
                                  isPr={h.isPr}
                                  meta={h.meta}
                                  value={h.value}
                                  deltaPct={h.deltaPct}
                                  tint={part.ink}
                                />
                              ))}
                            </GlassSurface>
                          </View>
                        )}

                        {/* muscles */}
                        {data.muscles.length > 0 && (
                          <View style={{ gap: 4 }}>
                            <Text style={{ fontFamily: mono(500), fontSize: 11, letterSpacing: 0.6, color: glass.ink3, paddingHorizontal: 4 }}>
                              {t("progress.exercise.muscles").toUpperCase()}
                            </Text>
                            <GlassSurface radius={18} style={{ padding: 16 }}>
                              {data.muscles.map((m) => (
                                <MuscleBar key={m.name} name={m.name} role={m.role} pct={m.pct} tint={part.ink} />
                              ))}
                            </GlassSurface>
                          </View>
                        )}

                        {/* agent handoff (read-only) */}
                        <GlassSurface radius={14} fallbackFill={glass.fill2} style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <Lock size={14} color={glass.ink3} strokeWidth={2} />
                          <Text style={{ flex: 1, fontFamily: mono(400), fontSize: 11, lineHeight: 16, color: glass.ink2 }}>
                            {t("progress.exercise.askAgent")}
                          </Text>
                        </GlassSurface>
                      </>
                    )
                  ) : (
                    <GuideTab
                      loading={guide.isLoading}
                      error={guide.isError}
                      gifUrl={guide.data?.gifUrl}
                      instructions={guide.data?.instructions ?? []}
                      tags={[guide.data?.bodyPart, guide.data?.equipment, guide.data?.target].filter(Boolean) as string[]}
                      onRetry={() => guide.refetch()}
                    />
                  )}
                </>
              );
            })()}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function GuideTab({
  loading,
  error,
  gifUrl,
  instructions,
  tags,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  gifUrl?: string;
  instructions: string[];
  tags: string[];
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={{ paddingTop: 28, alignItems: "center" }}>
        <ActivityIndicator color={glass.ink2} />
      </View>
    );
  }
  if (error) return <View style={{ paddingTop: 12 }}><ErrorBox onRetry={onRetry} /></View>;
  if (instructions.length === 0 && !gifUrl) {
    return (
      <View style={{ paddingTop: 24, alignItems: "center", paddingHorizontal: 40 }}>
        <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: glass.ink2, textAlign: "center" }}>
          {t("progress.exercise.guideSoon")}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {gifUrl && (
        <GlassSurface radius={18} style={{ padding: 6 }}>
          <Image
            source={{ uri: gifUrl }}
            style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
            contentFit="contain"
            transition={200}
            accessibilityLabel={t("progress.exercise.guideMediaAlt")}
          />
        </GlassSurface>
      )}
      {tags.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {tags.map((tag) => (
            <Chip key={tag} tone="neutral" label={tag} />
          ))}
        </View>
      )}
      {instructions.length > 0 && (
        <GlassSurface radius={18} style={{ padding: 16, gap: 12 }}>
          {instructions.map((step, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontFamily: sans(700), fontSize: 13, color: glass.lava, width: 18 }}>{i + 1}</Text>
              <Text style={{ flex: 1, fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink }}>
                {step}
              </Text>
            </View>
          ))}
        </GlassSurface>
      )}
    </View>
  );
}
