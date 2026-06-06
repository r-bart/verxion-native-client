/**
 * RutinaSegment — the Entreno landing's primary segment (the active-routine day
 * view). Composes the hero, the next action (live banner or next session), and
 * the weekly spine over the RoutineDashboard aggregate. Empty state (no routine)
 * invites the user to the agent. Loading → skeleton.
 *
 * Note: the agent note (`data.agentNote` → `AgentNoteCard`) is parked here until
 * the insights work lands — the aggregate still carries the field.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Rows3, ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useRoutineDashboard } from "../hooks/useRoutineDashboard";
import { RoutineHero } from "./RoutineHero";
import { NextSessionCard } from "./NextSessionCard";
import { WeekSpine } from "./WeekSpine";
import { RoutineDashboardSkeleton } from "./RoutineDashboardSkeleton";
import { SegmentError } from "./SegmentError";

function EmptyRoutine() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <GlassSurface
      radius={20}
      style={{ padding: 22, alignItems: "center", gap: 12 }}
    >
      <Isotype size={34} glow />
      <Text
        style={{
          fontFamily: sans(700),
          fontSize: 18,
          color: glass.white,
          textAlign: "center",
        }}
      >
        {t("training.empty.title")}
      </Text>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 13,
          lineHeight: 19,
          color: glass.ink2,
          textAlign: "center",
        }}
      >
        {t("training.empty.body")}
      </Text>
      <Pressable
        onPress={() => router.push("/agent" as Href)}
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
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 14,
              color: glass.fgOnLava,
            }}
          >
            {t("training.empty.cta")}
          </Text>
        </View>
      </Pressable>
    </GlassSurface>
  );
}

function AllRoutinesLink() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/workout/rutinas" as Href)}
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
        <Rows3 size={16} color={glass.ink2} strokeWidth={2} />
        <Text
          style={{
            flex: 1,
            fontFamily: sans(600),
            fontSize: 14,
            color: glass.white,
          }}
        >
          {t("training.routineLibrary.allRoutines")}
        </Text>
        <ChevronRight size={17} color="rgba(255,255,255,0.3)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

function LiveBanner({ name }: { name: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/workout/sesion" as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={20}
        tintColor={glass.lavaBg}
        fallbackFill={glass.lavaBg}
        style={{
          padding: 16,
          gap: 4,
          borderColor: glass.lavaBorder,
          borderWidth: 1,
        }}
      >
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 1,
            color: glass.lava,
            textTransform: "uppercase",
          }}
        >
          {t("training.screens.liveSession")}
        </Text>
        <Text
          style={{ fontFamily: sans(700), fontSize: 17, color: glass.white }}
        >
          {name}
        </Text>
      </GlassSurface>
    </Pressable>
  );
}

export function RutinaSegment() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useRoutineDashboard();
  const refresh = usePullToRefresh(refetch);

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: insets.bottom + 64,
    flexGrow: 1,
  }), [insets.bottom]);

  let body: React.ReactNode;
  if (isLoading) body = <RoutineDashboardSkeleton />;
  else if (isError || !data) body = <SegmentError onRetry={() => refetch()} />;
  else if (data.state === "empty" || !data.activeRoutine)
    body = <EmptyRoutine />;
  else
    body = (
      <View style={{ gap: 14 }}>
        <RoutineHero routine={data.activeRoutine} />
        {data.liveSession ? (
          <LiveBanner name={data.liveSession.name} />
        ) : data.next ? (
          <NextSessionCard next={data.next} />
        ) : null}
        <WeekSpine spine={data.spine} />
        <AllRoutinesLink />
      </View>
    );

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
