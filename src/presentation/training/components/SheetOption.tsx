/**
 * SheetOption — a single selectable row inside a BottomSheet (filter / sort /
 * select): a label with a trailing check when active. Shared by the Sesiones
 * and Ejercicios filter sheets.
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
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
        opacity: pressed ? glass.pressOpacity : 1,
      })}
    >
      <Text style={{ fontFamily: sans(selected ? 600 : 500), fontSize: 15, color: selected ? glass.white : glass.ink2 }}>
        {label}
      </Text>
      {selected ? <Check size={18} color={glass.lava} strokeWidth={2.5} /> : <View style={{ width: 18 }} />}
    </Pressable>
  );
}
