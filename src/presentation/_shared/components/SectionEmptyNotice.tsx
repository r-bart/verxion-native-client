/**
 * SectionEmptyNotice — a compact inline "this section has nothing" row in the
 * glass language, for mid-scroll gaps inside an otherwise-populated screen (a
 * detail hero is already painted above). Distinct from EmptyState, which is the
 * centered, flex:1 full-screen blank-slate.
 */
import { View, Text } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

type Props = { icon?: React.ReactNode; text: string };

export function SectionEmptyNotice({ icon, text }: Props) {
  return (
    <GlassSurface
      radius={16}
      style={{ padding: 18, flexDirection: "row", alignItems: "center", gap: 10 }}
    >
      {icon != null && <View>{icon}</View>}
      <Text
        style={{
          flex: 1,
          fontFamily: mono(400),
          fontSize: 12.5,
          lineHeight: 18,
          color: glass.ink2,
        }}
      >
        {text}
      </Text>
    </GlassSurface>
  );
}
