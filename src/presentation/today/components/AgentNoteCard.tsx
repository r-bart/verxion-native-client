/**
 * AgentNoteCard — the agent's note for the day. A lava-tinted glass card with
 * the isotype + author, then the (server-localized) message. Matches the
 * bordered card in the `01-Hoy` handoff.
 */
import { View, Text } from "react-native";
import type { AgentNote } from "@/domain/today/models/TodayDashboard";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export function AgentNoteCard({ note }: { note: AgentNote }) {
  return (
    <GlassSurface
      radius={18}
      tintColor={glass.lavaBg}
      fallbackFill={glass.lavaBg}
      style={{ padding: 16, gap: 10, borderColor: glass.lavaBorder, borderWidth: 1 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Isotype size={16} glow />
        <Text style={{ fontFamily: sans(700), fontSize: 12, color: glass.lava, letterSpacing: 0.1 }}>
          {note.author}
        </Text>
      </View>
      <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink }}>
        {note.message}
      </Text>
    </GlassSurface>
  );
}
