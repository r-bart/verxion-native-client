/**
 * MuscleBar — one muscle row of the exercise's involvement: name + role label +
 * a proportional bar (pct of involvement). `role` is rendered verbatim (the API
 * sends it as a label; see progress-screen-spec — swap to a mapped enum if it
 * ever arrives as a key).
 */
import { View, Text } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export function MuscleBar({
  name,
  role,
  pct,
  tint,
}: {
  name: string;
  role: string;
  pct: number;
  tint: string;
}) {
  return (
    <View style={{ gap: 6, paddingVertical: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}>{name}</Text>
        <Text style={{ fontFamily: mono(400), fontSize: 10, letterSpacing: 0.3, color: glass.ink3 }}>
          {role}
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }}>
        <View
          style={{
            width: `${Math.max(4, Math.min(100, pct))}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: tint,
          }}
        />
      </View>
    </View>
  );
}
