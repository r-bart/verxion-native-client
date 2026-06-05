import { useState } from "react";
import { View, Text, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSection } from "../components/SettingsSection";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

function ToggleRow({
  label,
  value,
  onValueChange,
  testID,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID: string;
}) {
  return (
    <View
      style={{
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontFamily: sans(500), fontSize: 15, color: glass.white }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: glass.fill, true: glass.lava }}
        testID={testID}
      />
    </View>
  );
}

/**
 * Notifications — page scaffold only. The toggles hold local state but nothing
 * is scheduled yet (no expo-notifications wiring this round); the note makes
 * that explicit.
 */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(false);
  const [logReminder, setLogReminder] = useState(false);
  const [streakReminder, setStreakReminder] = useState(false);

  return (
    <SettingsScaffold
      title={t("settings.screens.notifications.title")}
      subtitle={t("settings.screens.notifications.subtitle")}
    >
      <GlassSurface radius={14} style={{ padding: 14 }}>
        <Text style={{ fontFamily: mono(400), fontSize: 12, lineHeight: 18, color: glass.ink3 }}>
          {t("settings.screens.notifications.scaffoldNote")}
        </Text>
      </GlassSurface>

      <SettingsSection>
        <ToggleRow
          label={t("settings.screens.notifications.permission")}
          value={permission}
          onValueChange={setPermission}
          testID="notif-permission"
        />
      </SettingsSection>

      <SettingsSection label={t("settings.screens.notifications.remindersTitle")}>
        <ToggleRow
          label={t("settings.screens.notifications.logReminder")}
          value={logReminder}
          onValueChange={setLogReminder}
          testID="notif-log"
        />
        <ToggleRow
          label={t("settings.screens.notifications.streakReminder")}
          value={streakReminder}
          onValueChange={setStreakReminder}
          testID="notif-streak"
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}
