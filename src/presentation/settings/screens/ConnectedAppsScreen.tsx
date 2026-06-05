import { useState } from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { AppWindow } from "lucide-react-native";
import type { ConnectedApp, ConsentCategory } from "@/domain/settings";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { formatRelativeTime } from "@/presentation/_shared/lib/relativeTime";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useConnectedApps } from "../hooks/useConnectedApps";
import { useRevokeConnectedApp } from "../hooks/useRevokeConnectedApp";
import { useUpdateConnectedAppScopes } from "../hooks/useUpdateConnectedAppScopes";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

function AppCard({
  app,
  onRequestRevoke,
}: {
  app: ConnectedApp;
  onRequestRevoke: (app: ConnectedApp) => void;
}) {
  const { t, i18n } = useTranslation();
  const updateScopes = useUpdateConnectedAppScopes();

  const toggleCategory = (key: ConsentCategory, next: boolean) => {
    const active = new Set(app.categories.filter((c) => c.active).map((c) => c.key));
    if (next) active.add(key);
    else active.delete(key);
    const includeDestructive = app.categories.some((c) => active.has(c.key) && c.destructive);
    updateScopes.mutate({ clientId: app.clientId, categories: [...active], includeDestructive });
  };

  return (
    <GlassSurface radius={16} style={{ padding: 14, gap: 10 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }} numberOfLines={1}>
        {app.appName}
      </Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: mono(600), fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: glass.ink3 }}>
          {t("settings.screens.connectedApps.scopes")}
        </Text>
        {app.categories.map((c) => (
          <View
            key={c.key}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <Text style={{ fontFamily: sans(500), fontSize: 14, color: glass.ink }}>
              {t(`settings.categories.${c.key}`)}
            </Text>
            <Switch
              value={c.active}
              disabled={updateScopes.isPending}
              onValueChange={(next) => toggleCategory(c.key, next)}
              trackColor={{ false: glass.fill, true: glass.lava }}
              testID={`scope-${app.clientId}-${c.key}`}
            />
          </View>
        ))}
      </View>

      <View style={{ gap: 2 }}>
        {app.authorizedAt && (
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
            {t("settings.screens.connectedApps.authorized", {
              time: formatRelativeTime(app.authorizedAt, i18n.language),
            })}
          </Text>
        )}
        <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
          {t("settings.screens.connectedApps.tokens", { count: app.tokenCount })}
        </Text>
      </View>

      {updateScopes.isError && (
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.lava }}>
          {t("settings.screens.connectedApps.scopeError")}
        </Text>
      )}

      <View style={{ alignSelf: "flex-start" }}>
        <OnboardingButton
          label={t("settings.screens.connectedApps.revoke")}
          variant="secondary"
          onPress={() => onRequestRevoke(app)}
          testID={`revoke-app-${app.clientId}`}
        />
      </View>
    </GlassSurface>
  );
}

export function ConnectedAppsScreen() {
  const { t } = useTranslation();
  const apps = useConnectedApps();
  const revoke = useRevokeConnectedApp();
  const [appToRevoke, setAppToRevoke] = useState<ConnectedApp | null>(null);

  if (apps.isLoading) {
    return (
      <SettingsScaffold title={t("settings.screens.connectedApps.title")}>
        <ActivityIndicator color={glass.lava} style={{ marginTop: 24 }} />
      </SettingsScaffold>
    );
  }

  const list = apps.data ?? [];

  return (
    <SettingsScaffold
      title={t("settings.screens.connectedApps.title")}
      subtitle={t("settings.screens.connectedApps.subtitle")}
    >
      {list.length === 0 ? (
        <View style={{ paddingTop: 48 }}>
          <EmptyState
            icon={<AppWindow size={30} color={glass.ink2} strokeWidth={1.6} />}
            title={t("settings.screens.connectedApps.empty")}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((app) => (
            <AppCard key={app.clientId} app={app} onRequestRevoke={setAppToRevoke} />
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={appToRevoke != null}
        title={t("settings.screens.connectedApps.revoke")}
        message={t("settings.screens.connectedApps.revokeConfirm", { app: appToRevoke?.appName ?? "" })}
        confirmLabel={t("settings.screens.connectedApps.revoke")}
        loading={revoke.isPending}
        onCancel={() => setAppToRevoke(null)}
        onConfirm={() => {
          if (appToRevoke) revoke.mutate(appToRevoke.clientId);
          setAppToRevoke(null);
        }}
        testID="confirm-revoke-app"
      />
    </SettingsScaffold>
  );
}
