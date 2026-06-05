/**
 * SheetOption — a single selectable row inside a BottomSheet (filter / sort /
 * select): a label and a trailing check when active, with a lava-tinted
 * background on the selected row. Shared by the Sesiones and Ejercicios sheets.
 *
 * Layout lives on the inner View, never on the Pressable's style callback —
 * layout props returned from `({pressed}) => …` don't apply (see CLAUDE.md).
 */
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

export function SheetOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 13,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: selected ? glass.lavaBg : "transparent",
        }}
      >
        <Text style={{ fontFamily: sans(selected ? 600 : 500), fontSize: 15, color: selected ? glass.white : glass.ink2 }}>
          {label}
        </Text>
        {selected && <Check size={18} color={glass.lava} strokeWidth={2.5} />}
      </View>
    </Pressable>
  );
}
