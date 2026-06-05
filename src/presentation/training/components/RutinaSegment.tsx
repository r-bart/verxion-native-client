/**
 * RutinaSegment — the Entreno landing's primary segment (the active-routine day
 * view). Composes the hero, the next action (live banner or next session), the
 * agent note, and the weekly spine over the RoutineDashboard aggregate. Empty
 * state (no routine) invites the user to the agent. Loading → skeleton.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useRoutineDashboard } from "../hooks/useRoutineDashboard";
import { RoutineHero } from "./RoutineHero";
import { NextSessionCard } from "./NextSessionCard";
import { WeekSpine } from "./WeekSpine";
import { AgentNoteCard } from "./AgentNoteCard";
import { RoutineDashboardSkeleton } from "./RoutineDashboardSkeleton";

function EmptyRoutine() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <GlassSurface radius={20} style={{ padding: 22, alignItems: "center", gap: 12 }}>
      <Isotype size={34} glow />
      <Text style={{ fontFamily: sans(700), fontSize: 18, color: glass.white, textAlign: "center" }}>
        {t("training.empty.title")}
      </Text>
      <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink2, textAlign: "center" }}>
        {t("training.empty.body")}
      </Text>
      <Pressable
        onPress={() => router.push("/agent" as Href)}
        accessibilityRole="button"
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("training.empty.cta")}</Text>
        </View>
      </Pressable>
    </GlassSurface>
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
        style={{ padding: 16, gap: 4, borderColor: glass.lavaBorder, borderWidth: 1 }}
      >
        <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 1, color: glass.lava, textTransform: "uppercase" }}>
          {t("training.screens.liveSession")}
        </Text>
        <Text style={{ fontFamily: sans(700), fontSize: 17, color: glass.white }}>{name}</Text>
      </GlassSurface>
    </Pressable>
  );
}

function ErrorRoutine({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <GlassSurface radius={20} style={{ padding: 22, alignItems: "center", gap: 12 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center" }}>
        {t("common.somethingWentWrong")}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
        <View style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9999, backgroundColor: glass.lava }}>
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}>{t("common.retry")}</Text>
        </View>
      </Pressable>
    </GlassSurface>
  );
}

export function RutinaSegment() {
  const { data, isLoading, isError, refetch } = useRoutineDashboard();

  if (isLoading) return <RoutineDashboardSkeleton />;
  if (isError || !data) return <ErrorRoutine onRetry={() => refetch()} />;
  if (data.state === "empty" || !data.activeRoutine) return <EmptyRoutine />;

  return (
    <View style={{ gap: 14 }}>
      <RoutineHero routine={data.activeRoutine} />
      {data.liveSession ? (
        <LiveBanner name={data.liveSession.name} />
      ) : data.next ? (
        <NextSessionCard next={data.next} />
      ) : null}
      {data.agentNote && <AgentNoteCard message={data.agentNote} />}
      <WeekSpine spine={data.spine} />
    </View>
  );
}
