/**
 * AgentNoteCard — the agent's note on the diet day: a lava-tinted glass card with
 * the isotype + author and the (server-localized) message. Unlike Entreno (where
 * the note is parked), the handoff makes this a core part of the Plan segment.
 */
import { View, Text } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export function AgentNoteCard({ message }: { message: string }) {
  return (
    <GlassSurface
      radius={18}
      tintColor={glass.lavaBg}
      fallbackFill={glass.lavaBg}
      style={{
        padding: 16,
        gap: 10,
        borderColor: glass.lavaBorder,
        borderWidth: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Isotype size={16} glow />
        <Text
          style={{ fontFamily: sans(700), fontSize: 12, color: glass.lava }}
        >
          verxion
        </Text>
      </View>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 13,
          lineHeight: 19,
          color: glass.ink,
        }}
      >
        {message}
      </Text>
    </GlassSurface>
  );
}
