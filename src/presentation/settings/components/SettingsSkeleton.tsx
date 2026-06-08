/**
 * SettingsSkeleton — loading placeholder for settings subscreens. Rendered inside
 * the SettingsScaffold so the back/header chrome stays put while data loads.
 * `form` mirrors the label+field screens (Account/Personal/Privacy); `list`
 * mirrors the row screens (Health/Sessions/ConnectedApps).
 */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { SettingsScaffold } from "./SettingsScaffold";

type Props = { title: string; variant: "form" | "list" };

export function SettingsSkeleton({ title, variant }: Props) {
  return (
    <SettingsScaffold title={title}>
      <View style={{ gap: variant === "form" ? 18 : 10 }}>
        {variant === "form" && <SkeletonBlock height={120} radius={20} />}
        {Array.from({ length: variant === "form" ? 4 : 5 }).map((_, i) => (
          <SkeletonBlock key={i} height={variant === "form" ? 56 : 72} />
        ))}
      </View>
    </SettingsScaffold>
  );
}
