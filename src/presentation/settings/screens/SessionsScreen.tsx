import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthSessionItem } from "@/domain/settings";
import { useSignOut } from "@/presentation/auth/hooks/useSignOut";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { formatRelativeTime } from "@/presentation/_shared/lib/relativeTime";
import { formatSessionLabel } from "@/presentation/_shared/lib/sessionLabel";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSection } from "../components/SettingsSection";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SettingsSkeleton } from "../components/SettingsSkeleton";
import { useAuthSessions } from "../hooks/useAuthSessions";
import { useRevokeSession } from "../hooks/useRevokeSession";
import { useRevokeAllSessions } from "../hooks/useRevokeAllSessions";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

function Pill({ label, tone }: { label: string; tone: "accent" | "muted" }) {
  const accent = tone === "accent";
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
        backgroundColor: accent ? "rgba(95,227,154,0.14)" : glass.fill,
        borderWidth: 1,
        borderColor: accent ? "rgba(95,227,154,0.3)" : glass.stroke,
      }}
    >
      <Text style={{ fontFamily: sans(600), fontSize: 11, color: accent ? glass.up : glass.ink2 }}>
        {label}
      </Text>
    </View>
  );
}

export function SessionsScreen() {
  const { t, i18n } = useTranslation();
  const sessions = useAuthSessions();
  const revoke = useRevokeSession();
  const revokeAll = useRevokeAllSessions();
  const signOut = useSignOut();

  const [confirmEverywhere, setConfirmEverywhere] = useState(false);

  const detail = (label: string) => (
    <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{label}</Text>
  );

  const renderRow = (item: AuthSessionItem) => {
    const rowPending = revoke.isPending && revoke.variables === item.id;
    const signingOutThis = item.isCurrent && signOut.isPending;
    return (
      <GlassSurface key={item.id} radius={16} style={{ padding: 14, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white, flexShrink: 1 }}>
            {formatSessionLabel(item.display) || t("settings.screens.sessions.unknownDevice")}
          </Text>
          {item.isCurrent && <Pill label={t("settings.screens.sessions.current")} tone="accent" />}
          <Pill
            label={item.kind === "session" ? t("settings.screens.sessions.web") : t("settings.screens.sessions.oauth")}
            tone="muted"
          />
        </View>
        <View style={{ gap: 2 }}>
          {item.lastActiveAt &&
            detail(t("settings.screens.sessions.lastActive", { time: formatRelativeTime(item.lastActiveAt, i18n.language) }))}
          {item.createdAt &&
            detail(t("settings.screens.sessions.created", { time: formatRelativeTime(item.createdAt, i18n.language) }))}
          {item.ipAddress && detail(item.ipAddress)}
        </View>
        <View style={{ alignSelf: "flex-start", marginTop: 2 }}>
          {item.isCurrent ? (
            <OnboardingButton
              label={t("settings.screens.sessions.logoutThisDevice")}
              variant="secondary"
              loading={signingOutThis}
              onPress={() => !signOut.isPending && signOut.mutate()}
              testID="session-logout-current"
            />
          ) : (
            <OnboardingButton
              label={t("settings.screens.sessions.revoke")}
              variant="secondary"
              loading={rowPending}
              onPress={() => revoke.mutate(item.id)}
              testID={`session-revoke-${item.id}`}
            />
          )}
        </View>
      </GlassSurface>
    );
  };

  if (sessions.isLoading) {
    return <SettingsSkeleton title={t("settings.screens.sessions.title")} variant="list" />;
  }

  const items = sessions.data?.items ?? [];
  const total = sessions.data?.total ?? items.length;

  return (
    <SettingsScaffold
      title={t("settings.screens.sessions.title")}
      subtitle={t("settings.screens.sessions.subtitle")}
    >
      {items.length === 0 ? (
        <Text style={{ fontFamily: mono(400), fontSize: 13, color: glass.ink2 }}>
          {t("settings.screens.sessions.empty")}
        </Text>
      ) : (
        <>
          <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink3, marginTop: -8 }}>
            {t("settings.screens.sessions.total", { count: total })}
          </Text>
          <View style={{ gap: 10 }}>{items.map(renderRow)}</View>

          <SettingsSection>
            <View style={{ padding: 14, gap: 10 }}>
              <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>
                {t("settings.screens.sessions.revokeOthersDesc")}
              </Text>
              <OnboardingButton
                label={t("settings.screens.sessions.revokeOthers")}
                variant="secondary"
                loading={revokeAll.isPending && revokeAll.variables === false}
                onPress={() => revokeAll.mutate(false)}
                testID="revoke-others"
              />
              <View style={{ height: 1, backgroundColor: glass.stroke }} />
              <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>
                {t("settings.screens.sessions.signOutEverywhereDesc")}
              </Text>
              <OnboardingButton
                label={t("settings.screens.sessions.signOutEverywhere")}
                onPress={() => setConfirmEverywhere(true)}
                testID="sign-out-everywhere"
              />
            </View>
          </SettingsSection>

          {(revoke.isError || revokeAll.isError) && (
            <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.lava }}>
              {t("settings.screens.sessions.revokeError")}
            </Text>
          )}
        </>
      )}

      <ConfirmDialog
        visible={confirmEverywhere}
        title={t("settings.screens.sessions.signOutEverywhere")}
        message={t("settings.screens.sessions.signOutEverywhereConfirm")}
        confirmLabel={t("settings.screens.sessions.signOutEverywhere")}
        loading={revokeAll.isPending && revokeAll.variables === true}
        onCancel={() => setConfirmEverywhere(false)}
        onConfirm={() => {
          setConfirmEverywhere(false);
          revokeAll.mutate(true);
        }}
        testID="confirm-everywhere"
      />
    </SettingsScaffold>
  );
}
