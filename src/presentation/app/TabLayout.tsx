import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";

// Tab-sized isotype (≈28pt, with @2x/@3x density variants). The full-res
// `verxion-isotype.png` (2809×1654) rendered oversized as a native tab icon —
// the lava mark's two arms showed as two huge red blobs. Metro resolves the
// density suffixes from this base path.
const ISOTYPE = require("../../../assets/images/verxion-isotype-tab.png");

/**
 * Native iOS Liquid Glass tab bar (real UITabBar → system glass on iOS 26).
 * verxion (the agent) sits centered, 3rd of 5, with the lava isotype icon.
 * SF Symbols elsewhere; labels are i18n. Wiring ported from the design handoff.
 *
 * Lives in presentation (not the `app/(tabs)/_layout.tsx` route) so the route
 * file stays a thin delegator — same split as `AppShell` vs `app/_layout.tsx`.
 */
export function TabLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs tintColor={glass.lava} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} />
        <NativeTabs.Trigger.Label>{t("navigation.today")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="workout">
        <NativeTabs.Trigger.Icon sf={{ default: "dumbbell", selected: "dumbbell.fill" }} />
        <NativeTabs.Trigger.Label>{t("navigation.workouts")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="agent">
        {/* Both states resolve to the isotype image (renderingMode 'original' keeps
            its lava color), avoiding the RNScreens "icon and selectedIcon must be
            same type" crash that tintColor triggers on images. */}
        <NativeTabs.Trigger.Icon src={{ default: ISOTYPE, selected: ISOTYPE }} renderingMode="original" />
        <NativeTabs.Trigger.Label>{t("navigation.agent")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Icon sf="fork.knife" />
        <NativeTabs.Trigger.Label>{t("navigation.nutrition")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" />
        <NativeTabs.Trigger.Label>{t("navigation.progress")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
