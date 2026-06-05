import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { User, Activity, ShieldCheck, AppWindow, Database, LogOut, Lock } from "lucide-react-native";
import { useDI } from "@/infrastructure/di/DIContext";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { useSignOut } from "@/presentation/auth/hooks/useSignOut";
import { ProfileCard } from "../components/ProfileCard";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";
import { LanguageControl } from "../components/LanguageControl";
import { useLanguage } from "../hooks/useLanguage";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

/**
 * Settings hub — the entry point reached from the header avatar. The profile
 * card and grouped rows navigate to the subscreens; language, sign out and the
 * app version stay inline. Pushed over the tab bar by the root Stack.
 */
export function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const signOut = useSignOut();
  const { language, setLanguage } = useLanguage();
  const appVersion = useDI((c) => c.appInfo.version);

  const go = (path: string) => () => router.push(path as Href);

  // After sign-out the session query clears and AuthGuard redirects to login.
  const handleSignOut = () => {
    if (signOut.isPending) return;
    signOut.mutate();
  };

  return (
    <SettingsScaffold title={t("settings.title")}>
      <Pressable onPress={go("/settings/account")} accessibilityRole="button" testID="profile-card">
        {({ pressed }) => (
          <View style={{ opacity: pressed ? glass.pressOpacity : 1 }}>
            <ProfileCard
              name={user?.name ?? null}
              username={user?.username ?? null}
              email={user?.email ?? ""}
            />
          </View>
        )}
      </Pressable>

      <SettingsSection label={t("settings.groups.account")}>
        <SettingsRow
          label={t("settings.nav.account")}
          value={t("settings.nav.accountSub")}
          icon={User}
          onPress={go("/settings/account")}
          testID="nav-account"
        />
        <SettingsRow
          label={t("settings.nav.personal")}
          value={t("settings.nav.personalSub")}
          icon={Activity}
          onPress={go("/settings/personal")}
          testID="nav-personal"
        />
        <SettingsRow
          label={t("settings.nav.privacy")}
          value={t("settings.nav.privacySub")}
          icon={Lock}
          onPress={go("/settings/privacy")}
          testID="nav-privacy"
        />
      </SettingsSection>

      <SettingsSection label={t("settings.preferences")}>
        <SettingsRow
          label={t("settings.language")}
          right={<LanguageControl value={language} onChange={setLanguage} />}
        />
      </SettingsSection>

      <SettingsSection label={t("settings.groups.security")}>
        <SettingsRow
          label={t("settings.nav.sessions")}
          value={t("settings.nav.sessionsSub")}
          icon={ShieldCheck}
          onPress={go("/settings/sessions")}
          testID="nav-sessions"
        />
        <SettingsRow
          label={t("settings.nav.connectedApps")}
          value={t("settings.nav.connectedAppsSub")}
          icon={AppWindow}
          onPress={go("/settings/connected-apps")}
          testID="nav-connected-apps"
        />
      </SettingsSection>

      <SettingsSection label={t("settings.groups.data")}>
        <SettingsRow
          label={t("settings.nav.data")}
          value={t("settings.nav.dataSub")}
          icon={Database}
          onPress={go("/settings/data")}
          testID="nav-data"
        />
      </SettingsSection>

      <SettingsSection label={t("settings.groups.app")}>
        <SettingsRow
          label={t("settings.nav.health")}
          value={t("settings.nav.healthSub")}
          onPress={go("/settings/health")}
          testID="nav-health"
        />
        <SettingsRow
          label={t("settings.nav.notifications")}
          value={t("settings.nav.notificationsSub")}
          onPress={go("/settings/notifications")}
          testID="nav-notifications"
        />
        <SettingsRow
          label={t("settings.nav.about")}
          value={appVersion}
          onPress={go("/settings/about")}
          testID="nav-about"
        />
      </SettingsSection>

      <View style={{ gap: 8 }}>
        <SettingsSection>
          {signOut.isPending ? (
            <View
              style={{
                minHeight: 48,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <ActivityIndicator color={glass.lava} />
              <Text style={{ fontFamily: sans(500), fontSize: 15, color: glass.lava }}>
                {t("settings.signingOut")}
              </Text>
            </View>
          ) : (
            <SettingsRow
              label={t("settings.signOut")}
              icon={LogOut}
              onPress={handleSignOut}
              destructive
              testID="sign-out"
            />
          )}
        </SettingsSection>
        {signOut.isError && (
          <Text
            testID="sign-out-error"
            style={{
              fontFamily: mono(400),
              fontSize: 12,
              lineHeight: 16,
              color: glass.lava,
              marginLeft: 4,
            }}
          >
            {t("settings.signOutError")}
          </Text>
        )}
      </View>

      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 11,
          color: glass.ink3,
          textAlign: "center",
        }}
      >
        {t("settings.version")} {appVersion}
      </Text>
    </SettingsScaffold>
  );
}
