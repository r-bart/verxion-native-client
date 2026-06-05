import { Children, isValidElement } from "react";
import { View, StyleSheet } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SectionLabel } from "./SectionLabel";
import { glass } from "@/presentation/_shared/design/glass";

/**
 * A settings group: an optional uppercase label over a glass card that stacks
 * its rows with hairline separators between them. Compose `SettingsRow`s (or any
 * row-shaped node) as children.
 */
export function SettingsSection({ label, children }: { label?: string; children: React.ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View>
      {label != null && <SectionLabel>{label}</SectionLabel>}
      <GlassSurface radius={16}>
        {rows.map((row, i) => {
          // `Children.toArray` assigns each element a stable key by content/
          // position — prefer it over the bare loop index.
          const key = isValidElement(row) && row.key != null ? row.key : `row-${i}`;
          return (
            <View key={key}>
              {i > 0 && (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: glass.stroke, marginLeft: 16 }} />
              )}
              {row}
            </View>
          );
        })}
      </GlassSurface>
    </View>
  );
}
