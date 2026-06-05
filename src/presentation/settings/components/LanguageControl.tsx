import { View, Text, Pressable } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import type { Language } from "../hooks/useLanguage";

// Language names are shown as endonyms (each in its own language), the standard
// for language pickers — so they read correctly whatever the active locale.
const OPTIONS: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

/** Inline two-segment toggle for the app language. Applies immediately. */
export function LanguageControl({ value, onChange }: { value: Language; onChange: (next: Language) => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 2,
        padding: 3,
        borderRadius: 9999,
        backgroundColor: glass.fill,
        borderWidth: 1,
        borderColor: glass.stroke,
      }}
    >
      {OPTIONS.map(({ code, label }) => {
        const active = value === code;
        return (
          <Pressable
            key={code}
            onPress={() => onChange(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            testID={`language-${code}`}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
              backgroundColor: active ? "rgba(255,98,98,0.16)" : "transparent",
              borderWidth: 1,
              borderColor: active ? glass.lavaBorder : "transparent",
            }}
          >
            <Text style={{ fontFamily: sans(active ? 600 : 500), fontSize: 12.5, color: active ? glass.lava : glass.ink2 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
