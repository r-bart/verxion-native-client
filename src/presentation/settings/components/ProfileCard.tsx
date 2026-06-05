import { View, Text } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { initials } from "@/presentation/_shared/lib/initials";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Props = {
  name: string | null;
  username: string | null;
  email: string;
};

/**
 * Account identity block at the top of Settings: avatar disc + name + email.
 *
 * The avatar is an ad-hoc lighter disc (not the header's `GlassSurface`): inside
 * this glass card, glass-on-glass washes out, so a slightly brighter fill +
 * hairline keeps the initial legible. The header keeps the liquid-glass sphere
 * because it sits over the screen, not over another surface.
 */
export function ProfileCard({ name, username, email }: Props) {
  const displayName = name ?? username ?? email.split("@")[0];
  return (
    <GlassSurface radius={20} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 9999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.14)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
        }}
      >
        <Text style={{ fontFamily: sans(700), fontSize: 18, color: glass.white }}>
          {initials(name, username, email)}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ fontFamily: sans(700), fontSize: 17, letterSpacing: -0.3, color: glass.white }}>
          {displayName}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>
          {email}
        </Text>
      </View>
    </GlassSurface>
  );
}
