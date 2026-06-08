import { View, Text, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { HEALTH_METRICS } from "@/domain/health";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSkeleton } from "../components/SettingsSkeleton";
import { SettingsSection } from "../components/SettingsSection";
import {
  useHealthStatus,
  useRequestHealthAuthorization,
  useSetHealthMetric,
} from "../hooks/useHealth";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export function HealthScreen() {
  const { t } = useTranslation();
  const status = useHealthStatus();
  const authorize = useRequestHealthAuthorization();
  const setMetric = useSetHealthMetric();

  if (status.isLoading || !status.data) {
    return <SettingsSkeleton title={t("settings.screens.health.title")} variant="list" />;
  }

  const { available, connected, metrics } = status.data;

  return (
    <SettingsScaffold
      title={t("settings.screens.health.title")}
      subtitle={t("settings.screens.health.subtitle")}
    >
      {!available ? (
        <GlassSurface radius={18} style={{ padding: 16 }} testID="health-unavailable">
          <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: glass.ink2 }}>
            {t("settings.screens.health.unavailable")}
          </Text>
        </GlassSurface>
      ) : (
        <>
          <GlassSurface radius={18} style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 14, color: connected ? glass.up : glass.ink2 }}>
              {connected
                ? t("settings.screens.health.connected")
                : t("settings.screens.health.notConnected")}
            </Text>
            {!connected && (
              <View style={{ alignSelf: "flex-start" }}>
                <OnboardingButton
                  label={t("settings.screens.health.connect")}
                  loading={authorize.isPending}
                  onPress={() => authorize.mutate()}
                  testID="health-connect"
                />
              </View>
            )}
          </GlassSurface>

          {connected && (
            <SettingsSection label={t("settings.screens.health.metricsTitle")}>
              {HEALTH_METRICS.map((metric) => (
                <View
                  key={metric}
                  style={{
                    minHeight: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontFamily: sans(500), fontSize: 15, color: glass.white }}>
                    {t(`settings.screens.health.${metric}`)}
                  </Text>
                  <Switch
                    value={metrics[metric]}
                    disabled={setMetric.isPending}
                    onValueChange={(enabled) => setMetric.mutate({ metric, enabled })}
                    trackColor={{ false: glass.fill, true: glass.lava }}
                    testID={`health-metric-${metric}`}
                  />
                </View>
              ))}
            </SettingsSection>
          )}
        </>
      )}
    </SettingsScaffold>
  );
}
