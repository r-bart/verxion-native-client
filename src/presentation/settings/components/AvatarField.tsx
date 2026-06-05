import { View, Text } from "react-native";
import { initials } from "@/presentation/_shared/lib/initials";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  displayName: string | null;
  username: string | null;
  email: string;
};

const SIZE = 88;

/**
 * Account avatar — a read-only crystalline sphere matching the header's
 * `GlassAvatarButton` (liquid glass on iOS 26+, translucent fallback). Shows the
 * user's initial.
 *
 * It deliberately shows the INITIAL only, not a stored avatar image: today the
 * only `avatarUrl` is the OAuth provider's generated default (a flat coloured
 * circle saved at onboarding), which we don't want to surface. Rendering a real
 * uploaded avatar — plus the pick/upload/remove affordance — lands with social
 * features; the upload implementation (`useAvatar`, the Upload/RemoveAvatar use
 * cases, the `HttpSettingsRepository` methods) stays in place for that.
 */
export function AvatarField({ displayName, username, email }: Props) {
  return (
    <View style={{ alignItems: "center" }}>
      <GlassSurface
        radius={9999}
        interactive
        style={{
          width: SIZE,
          height: SIZE,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Text style={{ fontFamily: sans(700), fontSize: SIZE * 0.38, color: glass.white }}>
          {initials(displayName, username, email)}
        </Text>
      </GlassSurface>
    </View>
  );
}
