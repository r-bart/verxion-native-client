/**
 * TodayEmptyState — the empty "Hoy", synthesizing the handoff's scenarios
 * (`13/14 Estado Vacío`): the B concept that makes the next action prominent —
 * the two-step onboarding card and a battery of real, copyable agent prompts —
 * over the C "día latente" ghost timeline as quiet ambience below. The header is
 * owned by the screen (kept current), so this renders the body only.
 *
 * The steps card stays at the top in every empty case: its connection state is
 * real (driven by `useConnectedAgent` → connected-apps), so it is informative
 * rather than misleading — it tells a brand-new user to connect, and an already-
 * connected one that the next move is to ask their agent.
 */
import { View } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { AgentStepsCard } from "./AgentStepsCard";
import { AgentPromptCards } from "./AgentPromptCards";
import { GhostTimeline } from "./GhostTimeline";

function Divider() {
  return <View style={{ height: 1, backgroundColor: glass.stroke }} />;
}

export function TodayEmptyState() {
  return (
    <View style={{ gap: 22 }}>
      <AgentStepsCard />
      <AgentPromptCards />
      <Divider />
      <GhostTimeline />
    </View>
  );
}
