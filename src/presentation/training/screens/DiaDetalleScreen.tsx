/**
 * DiaDetalleScreen — a workout day's metadata + its ordered exercise plan
 * (read-only). The hero, the "El plan" exercise list (each taps into the exercise
 * detail), and an "ask the agent" surface. Changing the day is a request to the
 * agent, never an edit. Rest days render a minimal view.
 */
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, Sparkles, Moon, Dumbbell } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { SectionEmptyNotice } from "@/presentation/_shared/components/SectionEmptyNotice";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DetailScaffold } from "../components/DetailScaffold";
import { SegmentError } from "../components/SegmentError";
import { DayDetailHero } from "../components/DayDetailHero";
import { DayExerciseCard } from "../components/DayExerciseCard";
import { useDayDetailView } from "../hooks/useDayDetailView";

function AskAgentSurface() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/agent" as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={18}
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: glass.lavaBg,
            borderWidth: 1,
            borderColor: glass.lavaBorder,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={18} color={glass.lava} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
          >
            {t("training.dayDetail.ask.title")}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink2,
              lineHeight: 16,
            }}
          >
            {t("training.dayDetail.ask.body")}
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      </GlassSurface>
    </Pressable>
  );
}

export function DiaDetalleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDayDetailView(id ?? "");
  const refresh = usePullToRefresh(refetch);

  if (isLoading) {
    return (
      <DetailScaffold title={t("training.screens.dayDetail")}>
        <View style={{ gap: 12, paddingTop: 4 }}>
          <SkeletonBlock radius={24} height={190} />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} radius={16} height={96} />
          ))}
        </View>
      </DetailScaffold>
    );
  }
  if (isError || !data) {
    return (
      <DetailScaffold title={t("training.screens.dayDetail")}>
        <View style={{ paddingTop: 8 }}>
          <SegmentError onRetry={() => refetch()} />
        </View>
      </DetailScaffold>
    );
  }

  if (data.isRest) {
    return (
      <DetailScaffold title={data.header.name} refreshControl={<GlassRefreshControl {...refresh} />}>
        <View style={{ paddingTop: 4, gap: 18 }}>
          <GlassSurface
            radius={24}
            style={{ padding: 26, alignItems: "center", gap: 12 }}
          >
            <IconBubble bg={palette.insight.background} size={56}>
              <Moon size={28} color={palette.insight.text} strokeWidth={2} />
            </IconBubble>
            <Text
              style={{
                fontFamily: sans(700),
                fontSize: 18,
                color: glass.white,
              }}
            >
              {t("training.dayDetail.restTitle")}
            </Text>
            <Text
              style={{
                fontFamily: mono(400),
                fontSize: 12.5,
                lineHeight: 18,
                color: glass.ink2,
                textAlign: "center",
              }}
            >
              {t("training.dayDetail.restBody", {
                focus: data.restFocus ?? data.header.focus,
              })}
            </Text>
          </GlassSurface>
          <AskAgentSurface />
        </View>
      </DetailScaffold>
    );
  }

  return (
    <DetailScaffold title={data.header.name} refreshControl={<GlassRefreshControl {...refresh} />}>
      <View style={{ paddingTop: 4, gap: 18 }}>
        <DayDetailHero header={data.header} />

        <View style={{ gap: 11 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text
              style={{
                fontFamily: mono(600),
                fontSize: 11,
                letterSpacing: 0.6,
                color: glass.ink2,
                textTransform: "uppercase",
              }}
            >
              {t("training.dayDetail.plan")}
            </Text>
            <Text
              style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            >
              {t("training.dayDetail.planCount", {
                count: data.exercises.length,
              })}
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: glass.stroke }}
            />
          </View>

          <View style={{ gap: 8 }}>
            {data.exercises.length === 0 ? (
              <SectionEmptyNotice
                icon={<Dumbbell size={16} color={glass.ink3} strokeWidth={2} />}
                text={t("training.dayDetail.noExercises")}
              />
            ) : (
              data.exercises.map((ex) => (
                <DayExerciseCard
                  key={ex.exerciseId}
                  exercise={ex}
                  type={data.header.type}
                />
              ))
            )}
          </View>
        </View>

        <AskAgentSurface />
      </View>
    </DetailScaffold>
  );
}
