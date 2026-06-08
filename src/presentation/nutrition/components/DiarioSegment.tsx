/**
 * DiarioSegment — the Nutrición landing's "Diario" segment: a rolling summary
 * (avg adherence / kcal / protein) over the logged days grouped by diet phase.
 * Each day taps through to its detail. Loading → skeleton; error → retry; no logged
 * days → empty. Read-only. Mirrors `PlanSegment`.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { CalendarDays, Star, ChevronRight } from "lucide-react-native";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt, dShortDate } from "../lib/format";
import { useDiaryFeed } from "../hooks/useDiaryFeed";
import type {
  DiaryDay,
  DiarySummary,
} from "@/domain/nutrition/models/DiaryFeed";

function RetryButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 11,
          borderRadius: 9999,
          backgroundColor: glass.lava,
        }}
      >
        <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>
          {t("common.retry")}
        </Text>
      </View>
    </Pressable>
  );
}

function SummaryCard({ summary }: { summary: DiarySummary }) {
  const { t } = useTranslation();
  const cells: { value: string; label: string }[] = [
    {
      value: summary.avgAdherence != null ? `${Math.round(summary.avgAdherence)}%` : "—",
      label: t("nutrition.diary.avgAdherence"),
    },
    {
      value: summary.avgKcal != null ? nInt(summary.avgKcal) : "—",
      label: t("nutrition.diary.avgKcal"),
    },
    {
      value: summary.avgProtein != null ? nInt(summary.avgProtein) : "—",
      label: t("nutrition.diary.avgProtein"),
    },
  ];
  return (
    <GlassSurface radius={20} style={{ padding: 16, gap: 12 }}>
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 10.5,
          letterSpacing: 0.8,
          color: glass.ink2,
          textTransform: "uppercase",
        }}
      >
        {t("nutrition.diary.summaryTitle", { days: summary.windowDays })}
      </Text>
      <View style={{ flexDirection: "row" }}>
        {cells.map((c) => (
          <View key={c.label} style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 19, color: glass.white }}>
              {c.value}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 10.5, color: glass.ink3 }}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </GlassSurface>
  );
}

function DiaryDayRow({ day }: { day: DiaryDay }) {
  const { t } = useTranslation();
  const router = useRouter();
  const date = dShortDate(day.date) ?? day.date;
  return (
    <Pressable
      onPress={() => router.push(`/nutrition/diario/${day.date}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={14}
        style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}
      >
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}>
              {date}
            </Text>
            {day.star && (
              <Star size={12} color={palette.neutral.text} strokeWidth={2.2} fill={palette.neutral.text} />
            )}
          </View>
          <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }}>
            {t("nutrition.diary.dayMeta", {
              kcal: nInt(day.kcal),
              protein: nInt(day.protein),
            })}
          </Text>
        </View>
        {day.adherence != null && (
          <Text style={{ fontFamily: mono(600), fontSize: 12.5, color: glass.up }}>
            {Math.round(day.adherence)}%
          </Text>
        )}
        <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

const PHASE_TONE: Record<string, string> = {
  active: glass.lava,
  completed: glass.up,
  paused: palette.neutral.text,
};

export function DiarioSegment() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDiaryFeed();
  const refresh = usePullToRefresh(refetch);

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: insets.bottom + 64,
      flexGrow: 1,
    }),
    [insets.bottom]
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View style={{ gap: 12 }}>
        <SkeletonBlock radius={20} height={96} />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} radius={14} height={60} />
        ))}
      </View>
    );
  } else if (isError || !data) {
    body = (
      <EmptyState
        icon={<CalendarDays size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("nutrition.error.title")}
        body={t("nutrition.error.body")}
        action={<RetryButton onPress={() => refetch()} />}
      />
    );
  } else if (data.phases.length === 0) {
    body = (
      <EmptyState
        icon={<CalendarDays size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("nutrition.diary.empty.title")}
        body={t("nutrition.diary.empty.body")}
      />
    );
  } else {
    body = (
      <View style={{ gap: 18 }}>
        {data.summary && <SummaryCard summary={data.summary} />}
        {data.phases.map((phase) => (
          <View key={phase.id} style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}
                numberOfLines={1}
              >
                {phase.name}
              </Text>
              {phase.avgAdherence != null && (
                <Text
                  style={{
                    fontFamily: mono(500),
                    fontSize: 12,
                    color: PHASE_TONE[phase.state] ?? glass.ink2,
                  }}
                >
                  {t("nutrition.dietas.adherence", {
                    pct: Math.round(phase.avgAdherence),
                  })}
                </Text>
              )}
            </View>
            <View style={{ gap: 8 }}>
              {phase.days.map((d) => (
                <DiaryDayRow key={d.id} day={d} />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={<GlassRefreshControl {...refresh} />}
    >
      {body}
    </ScrollView>
  );
}
