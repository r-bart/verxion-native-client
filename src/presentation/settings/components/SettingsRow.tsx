import { View, Text, Pressable } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Props = {
  label: string;
  icon?: LucideIcon;
  /** Trailing static value (e.g. version number). Ignored when `right` is set. */
  value?: string;
  /** Custom trailing control (e.g. a language toggle). Replaces value/chevron. */
  right?: React.ReactNode;
  /** Makes the row pressable; renders a chevron unless `right` is set. */
  onPress?: () => void;
  destructive?: boolean;
  testID?: string;
};

/** One settings line: leading icon + label, trailing value, control, or chevron. */
export function SettingsRow({ label, icon: Icon, value, right, onPress, destructive, testID }: Props) {
  const tint = destructive ? glass.lava : glass.white;
  const content = (
    <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, gap: 12 }}>
      {Icon != null && <Icon size={18} color={destructive ? glass.lava : glass.ink2} strokeWidth={2} />}
      <Text numberOfLines={1} style={{ flexShrink: 0, fontFamily: sans(500), fontSize: 15, color: tint }}>
        {label}
      </Text>
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        {right != null ? (
          right
        ) : (
          <>
            {value != null && (
              <Text
                numberOfLines={1}
                style={{ flexShrink: 1, fontFamily: mono(400), fontSize: 13, color: glass.ink3, textAlign: "right" }}
              >
                {value}
              </Text>
            )}
            {onPress != null && <ChevronRight size={18} color={glass.ink3} strokeWidth={2} />}
          </>
        )}
      </View>
    </View>
  );

  if (onPress == null) return content;
  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="button" android_ripple={{ color: glass.fill2 }}>
      {({ pressed }) => <View style={{ opacity: pressed ? glass.pressOpacity : 1 }}>{content}</View>}
    </Pressable>
  );
}
