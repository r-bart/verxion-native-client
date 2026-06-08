/**
 * RutinaDetalleScreen — a routine's metadata + its day rotation (read-only). The
 * hero, the "La rotación" day list (each day taps into its detail / today's
 * prescription), a link to this block's sessions, and an "ask the agent" surface.
 * Adjusting a routine is a request to the agent, never an edit here.
 */
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Layers, ChevronRight, Sparkles } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { SectionEmptyNotice } from "@/presentation/_shared/components/SectionEmptyNotice";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DetailScaffold } from "../components/DetailScaffold";
import { SegmentError } from "../components/SegmentError";
import { RoutineDetailHero } from "../components/RoutineDetailHero";
import { RoutineDayCard } from "../components/RoutineDayCard";
import { useRoutineDetailView } from "../hooks/useRoutineDetailView";
import type { RoutineLibraryState } from "@/domain/training/models/RoutineLibrary";

const ASK_KEY: Record<RoutineLibraryState, string> = {
  active: "adjust",
  draft: "activate",
  paused: "resume",
  completed: "repeat",
};

function SessionsLink({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 11,
        }}
      >
        <Layers size={16} color={glass.ink2} strokeWidth={2} />
        <Text
          style={{
            flex: 1,
            fontFamily: sans(600),
            fontSize: 14,
            color: glass.white,
          }}
        >
          {t("training.routineDetail.sessionsLink")}
        </Text>
        <Text
          style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink2 }}
        >
          {count}
        </Text>
        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      </GlassSurface>
    </Pressable>
  );
}

function AskAgentSurface({ state }: { state: RoutineLibraryState }) {
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
            {t(`training.routineDetail.ask.${ASK_KEY[state]}.title`)}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink2,
              lineHeight: 16,
            }}
          >
            {t(`training.routineDetail.ask.${ASK_KEY[state]}.body`)}
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

export function RutinaDetalleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useRoutineDetailView(id ?? "");
  const refresh = usePullToRefresh(refetch);

  if (isLoading) {
    return (
      <DetailScaffold title={t("training.screens.routineDetail")}>
        <View style={{ gap: 12, paddingTop: 4 }}>
          <SkeletonBlock radius={24} height={230} />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} radius={16} height={72} />
          ))}
        </View>
      </DetailScaffold>
    );
  }
  if (isError || !data) {
    return (
      <DetailScaffold title={t("training.screens.routineDetail")}>
        <View style={{ paddingTop: 8 }}>
          <SegmentError onRetry={() => refetch()} />
        </View>
      </DetailScaffold>
    );
  }

  return (
    <DetailScaffold title={data.header.name} refreshControl={<GlassRefreshControl {...refresh} />}>
      <View style={{ paddingTop: 4, gap: 18 }}>
        <RoutineDetailHero header={data.header} />

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
              {t("training.routineDetail.rotation")}
            </Text>
            <Text
              style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            >
              {data.restDaysCount > 0
                ? t("training.routineDetail.rotationCount", {
                    days: data.trainingDaysCount,
                    rest: data.restDaysCount,
                  })
                : t("training.routineDetail.rotationCountNoRest", {
                    days: data.trainingDaysCount,
                  })}
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: glass.stroke }}
            />
          </View>

          <View style={{ gap: 8 }}>
            {data.days.length === 0 ? (
              <SectionEmptyNotice
                icon={<Layers size={16} color={glass.ink3} strokeWidth={2} />}
                text={t("training.routineDetail.noDays")}
              />
            ) : (
              data.days.map((day, i) => (
                <RoutineDayCard key={day.dayId ?? `rest-${i}`} day={day} />
              ))
            )}
          </View>
        </View>

        {data.sessionsBlockCount > 0 && (
          <SessionsLink
            count={data.sessionsBlockCount}
            onPress={() => router.push("/workout" as Href)}
          />
        )}

        <AskAgentSurface state={data.header.state} />
      </View>
    </DetailScaffold>
  );
}
