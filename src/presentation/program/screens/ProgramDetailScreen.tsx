/**
 * ProgramDetailScreen — "Detalle de programa": the container metadata (hero +
 * window), the unified adherence (ring + sub-bars), the agent note, the weekly
 * calendar heatmap, and the coupled routine/diet cards. Read-only — activating /
 * pausing / adjusting is a request to the agent. Reaches here from the library
 * (`/programas/[id]`) or from the Hoy slot (`/programas/activo`, no id → active).
 * Mirrors the handoff `ProgramaDetalleScreen`.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  CalendarRange,
  Clock,
  Link2,
  Sparkles,
  LayoutGrid,
} from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramOverview } from "@/domain/program/models/Program";
import { useProgram } from "../hooks/useProgram";
import { useActiveProgram } from "../hooks/useActiveProgram";
import { useProgramAdherence } from "../hooks/useProgramAdherence";
import { programGoalVisual } from "../lib/programGoalVisual";
import { programStatusColor } from "../lib/programStatus";
import { pgShortDate, pgWindow, pgTrainingDays } from "../lib/format";
import { ProgramAdherenceCard } from "../components/ProgramAdherenceCard";
import { ProgramScheduleCalendar } from "../components/ProgramScheduleCalendar";
import { ProgramCouplingCards } from "../components/ProgramCouplingCards";

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        {icon}
        <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>{value}</Text>
      </View>
      <Text style={{ fontFamily: mono(400), fontSize: 10.5, color: glass.ink3 }}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, count }: { title: string; count?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24, marginBottom: 12 }}>
      <Text style={{ fontFamily: mono(600), fontSize: 11, letterSpacing: 0.6, color: glass.ink, textTransform: "uppercase" }}>{title}</Text>
      {count ? <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{count}</Text> : null}
      <View style={{ flex: 1, height: 1, backgroundColor: glass.stroke }} />
    </View>
  );
}

function Hero({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  const cfg = programGoalVisual(program.goal);
  const statusColor = programStatusColor(program.status);
  const goalLabel = program.goal ? t(`program.goals.${program.goal}`) : null;
  const coupled = (program.routine ? 1 : 0) + (program.dietPlan ? 1 : 0);
  const hasWeeks = typeof program.totalWeeks === "number" && program.totalWeeks > 0;
  const windowShort =
    program.durationType === "indefinite" || !hasWeeks
      ? t("program.windowIndefinite")
      : t("program.windowShort", { weeks: program.totalWeeks });

  const ctx =
    program.status === "draft"
      ? t("program.detail.ctxCreated", { date: pgShortDate(program.createdAt) ?? "" })
      : program.status === "completed"
        ? t("program.detail.ctxFinished", { date: pgShortDate(program.finishedDate ?? program.endDate) ?? "" })
        : program.status === "paused"
          ? t("program.detail.ctxPaused")
          : t("program.detail.ctxUpdated", { date: pgShortDate(program.updatedAt) ?? "" });

  return (
    <GlassSurface radius={22} style={{ padding: 18, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {program.status === "active" && <View style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: statusColor }} />}
          <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.8, color: statusColor, textTransform: "uppercase" }}>
            {t(`program.status.${program.status}`)}
          </Text>
        </View>
        <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{ctx}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <IconBubble bg={cfg.bg} size={52} radius={16}>
          <cfg.Icon size={26} color={cfg.color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 7 }}>
          <Text style={{ fontFamily: sans(700), fontSize: 21, color: glass.white, letterSpacing: -0.5 }} numberOfLines={2}>
            {program.name}
          </Text>
          {goalLabel && (
            <View style={{ flexDirection: "row" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9999, backgroundColor: cfg.bg, borderWidth: 1, borderColor: cfg.color + "55" }}>
                <Target size={11} color={cfg.color} strokeWidth={2} />
                <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: cfg.color }}>{goalLabel}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {program.description && (
        <Text style={{ fontFamily: mono(400), fontSize: 12.5, color: glass.ink2, lineHeight: 18 }}>{program.description}</Text>
      )}

      <View style={{ flexDirection: "row", gap: 10, paddingTop: 2 }}>
        <Stat icon={<CalendarRange size={14} color={glass.ink2} strokeWidth={2} />} value={`${pgTrainingDays(program)}`} label={t("program.detail.perWeek")} />
        <Stat icon={<Clock size={14} color={glass.ink2} strokeWidth={2} />} value={windowShort} label={t(program.durationType === "indefinite" ? "program.detail.duration" : "program.detail.window")} />
        <Stat icon={<Link2 size={14} color={glass.ink2} strokeWidth={2} />} value={`${coupled}/2`} label={t("program.detail.coupled")} />
      </View>

      {program.durationType === "date_range" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, backgroundColor: glass.fill, borderWidth: 1, borderColor: glass.stroke }}>
          <CalendarRange size={11} color={glass.ink3} strokeWidth={2} />
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>{pgWindow(program, t("program.windowIndefinite"))}</Text>
        </View>
      )}
    </GlassSurface>
  );
}

function AgentNote({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  if (!program.agentNote) return null;
  return (
    <GlassSurface radius={18} style={{ padding: 15, flexDirection: "row", gap: 12, marginTop: 14 }}>
      <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: glass.lavaBg, borderWidth: 1, borderColor: glass.lavaBorder, alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={15} color={glass.lava} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: mono(600), fontSize: 9.5, letterSpacing: 0.6, color: glass.ink3, textTransform: "uppercase" }}>
          {t(program.status === "draft" ? "program.detail.noteWhy" : "program.detail.noteAbout")}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 12.5, color: glass.ink, lineHeight: 18 }}>{program.agentNote}</Text>
      </View>
    </GlassSurface>
  );
}

function AskAgent({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  const router = useRouter();
  const incomplete = !program.routine && !program.dietPlan;
  const key =
    program.status === "draft"
      ? incomplete ? "activateIncomplete" : "activate"
      : program.status === "paused"
        ? "resume"
        : program.status === "completed"
          ? "repeat"
          : "adjust";
  return (
    <View style={{ marginTop: 32 }}>
      <Pressable onPress={() => router.push("/agent" as Href)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
        <GlassSurface radius={18} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 13 }}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: glass.lavaBg, borderWidth: 1, borderColor: glass.lavaBorder, alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color={glass.lava} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}>{t(`program.detail.ask.${key}.title`)}</Text>
            <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}>{t(`program.detail.ask.${key}.body`)}</Text>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
        </GlassSurface>
      </Pressable>
    </View>
  );
}

export function ProgramDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const byId = useProgram(id ?? "");
  const active = useActiveProgram(!id);
  const query = id ? byId : active;
  const program = (id ? byId.data : active.data) ?? undefined;

  const adherence = useProgramAdherence(program?.id ?? "");

  const refresh = usePullToRefresh(async () => {
    await query.refetch();
    if (program?.id) await adherence.refetch();
  });

  let body: React.ReactNode;
  if (query.isLoading) {
    body = (
      <View style={{ gap: 14, paddingTop: 8 }}>
        <SkeletonBlock radius={22} height={230} />
        <SkeletonBlock radius={20} height={190} />
      </View>
    );
  } else if (query.isError || !program) {
    body = (
      <EmptyState
        icon={<LayoutGrid size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("program.detail.error.title")}
        body={t("program.detail.error.body")}
      />
    );
  } else {
    const showAdherence =
      program.status !== "draft" &&
      adherence.data != null &&
      adherence.data.unifiedExecutionScore != null;
    body = (
      <>
        <Hero program={program} />
        {showAdherence && adherence.data && (
          <View style={{ marginTop: 14 }}>
            <ProgramAdherenceCard adherence={adherence.data} />
          </View>
        )}
        <AgentNote program={program} />

        {program.weeklySchedule && program.weeklySchedule.length > 0 && (
          <>
            <SectionHeader title={t("program.detail.weekTitle")} count={t("program.detail.weekTrainingDays", { count: pgTrainingDays(program) })} />
            <ProgramScheduleCalendar schedule={program.weeklySchedule} />
          </>
        )}

        <SectionHeader title={t("program.detail.couplesTitle")} count={t("program.detail.couplesHint")} />
        <ProgramCouplingCards program={program} />

        <AskAgent program={program} />
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 }}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push("/today" as Href))}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
          >
            <GlassSurface radius={19} style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
          <Text style={{ flex: 1, fontFamily: sans(700), fontSize: 18, color: glass.white, letterSpacing: -0.4 }} numberOfLines={1}>
            {program?.name ?? t("program.title")}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 96 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<GlassRefreshControl {...refresh} />}
        >
          {body}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
