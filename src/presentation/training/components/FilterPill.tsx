/**
 * FilterPill — the pill-shaped filter/sort trigger shared across the Entreno
 * surfaces (the landing's Sesiones/Ejercicios segments and the routines
 * library): a translucent `glass.fill2` pill with a leading icon + label.
 *
 * Per CLAUDE.md, equal-width pills in a flex row get `flex:1` on a plain
 * wrapper View around this component — never here, and never on the Pressable's
 * style callback (a flex returned from `({pressed}) => …` doesn't size the slot).
 *
 * Two trailing affordances, never combined:
 *   - `badge`    — a lava count bubble after the label (label stays centered).
 *   - `trailing` — an end-aligned node (e.g. a chevron) that grows the label to
 *                  fill and truncates it; for dynamic labels that may overflow.
 */
import { View, Text, Pressable } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  badge?: number;
  trailing?: React.ReactNode;
};

export function FilterPill({ icon, label, onPress, badge, trailing }: Props) {
  const spread = trailing != null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: spread ? "flex-start" : "center",
          gap: 7,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 9999,
          backgroundColor: glass.fill2,
          borderWidth: 1,
          borderColor: glass.stroke,
        }}
      >
        {icon}
        <Text
          numberOfLines={1}
          style={{
            ...(spread ? { flex: 1 } : null),
            fontFamily: sans(600),
            fontSize: 13,
            color: glass.white,
          }}
        >
          {label}
        </Text>
        {badge != null && badge > 0 && (
          <View
            style={{
              minWidth: 17,
              height: 17,
              paddingHorizontal: 4,
              borderRadius: 9999,
              backgroundColor: glass.lava,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ fontFamily: sans(700), fontSize: 10.5, color: glass.fgOnLava }}
            >
              {badge}
            </Text>
          </View>
        )}
        {trailing}
      </View>
    </Pressable>
  );
}
