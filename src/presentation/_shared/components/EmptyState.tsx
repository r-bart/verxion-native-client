/**
 * EmptyState — the app-wide blank-slate primitive in the glass language:
 * centered glass icon sphere + title + optional body, with an optional action
 * slot. Used for "no data yet" states and, for now, as the body of not-yet-built
 * tabs (ComingSoon).
 */
import { View, Text } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Props = {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 18 }}>
      {icon != null && (
        <GlassSurface radius={9999} style={{ width: 76, height: 76, alignItems: "center", justifyContent: "center" }}>
          {icon}
        </GlassSurface>
      )}
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: sans(700), fontSize: 20, letterSpacing: -0.3, color: glass.white, textAlign: "center" }}>
          {title}
        </Text>
        {body != null && (
          <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: glass.ink2, textAlign: "center" }}>
            {body}
          </Text>
        )}
      </View>
      {action != null && <View style={{ marginTop: 4 }}>{action}</View>}
    </View>
  );
}
