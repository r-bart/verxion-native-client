/**
 * TodayScreen — "Hoy", the read-only command centre for the day. Thin: fetches
 * the aggregate via `useTodayDashboard` and composes the section components over
 * the screen bloom. Loading → skeleton; error → empty state.
 *
 * Three render paths once data is in:
 * - **empty** (cold-start, or a sparse day with nothing logged) → `TodayEmptyState`,
 *   the agent-led empty experience (handoff `13/14`): ghost ambience + the
 *   two-step card + copyable prompts.
 * - **populated** → the real ring + fronts, the active routine, and the day
 *   timeline ("la espina"); an empty timeline on an otherwise-active day still
 *   shows the ghost timeline rather than dead space.
 */
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { glass } from "@/presentation/_shared/design/glass";
import { useTodayDashboard } from "../hooks/useTodayDashboard";
import { TodayHeader } from "../components/TodayHeader";
import { DaySummary } from "../components/DaySummary";
import { RoutineRow } from "../components/RoutineRow";
// import { AgentNoteCard } from "../components/AgentNoteCard"; // hidden for now
import { DayTimeline } from "../components/DayTimeline";
import { GhostTimeline } from "../components/GhostTimeline";
import { TodayEmptyState } from "../components/TodayEmptyState";
import { TodaySkeleton } from "../components/TodaySkeleton";

function Divider() {
  return <View style={{ height: 1, backgroundColor: glass.stroke }} />;
}

export function TodayScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useTodayDashboard();

  // The empty day: a cold-start (no fronts/plan/events), or a sparse day with
  // nothing logged and too few fronts for a meaningful ring. Both become the
  // agent-led empty experience instead of a lonely/degenerate ring.
  const isColdStart =
    !!data && data.fronts.length === 0 && data.routine == null && data.timeline.length === 0;
  const sparseEmpty =
    !!data && data.timeline.length === 0 && data.ring.completed === 0 && data.fronts.length <= 2;
  const showEmpty = isColdStart || sparseEmpty;

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {isLoading ? (
          <TodaySkeleton />
        ) : isError || !data ? (
          <EmptyState
            icon={<Sparkles size={28} color={glass.lava} strokeWidth={2} />}
            title={t("today.error.title")}
            body={t("today.error.body")}
          />
        ) : showEmpty ? (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120, gap: 22 }}
            showsVerticalScrollIndicator={false}
          >
            <TodayHeader date={data.date} />
            <TodayEmptyState />
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120, gap: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <TodayHeader date={data.date} />
            <DaySummary ring={data.ring} fronts={data.fronts} />
            {data.routine && (
              <>
                <Divider />
                <RoutineRow routine={data.routine} />
              </>
            )}
            {/* Agent note hidden for now (kept wired; re-enable when ready). */}
            {/* {data.agentNote && <AgentNoteCard note={data.agentNote} />} */}
            <Divider />
            {data.timeline.length > 0 ? (
              <DayTimeline events={data.timeline} />
            ) : (
              <GhostTimeline />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
