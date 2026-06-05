import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import type { UserAccount, AthleteProfile } from "@/domain/settings";
import { inputStyle, FieldLabel } from "@/presentation/_shared/components/Field";
import { useUsernameAvailability } from "@/presentation/_shared/hooks/useUsernameAvailability";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SaveBar } from "../components/SaveBar";
import { AvatarField } from "../components/AvatarField";
import { useAccount } from "../hooks/useAccount";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import { useUpdateUsername } from "../hooks/useUpdateUsername";
import { useUpdateAthleteProfile } from "../hooks/useUpdateAthleteProfile";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

const USERNAME_COOLDOWN_DAYS = 30;
const DAY_MS = 86_400_000;

export function AccountScreen() {
  const { t } = useTranslation();
  const account = useAccount();
  const profileQuery = useAthleteProfile();
  const profile = profileQuery.data;

  if (profileQuery.isLoading || account.isLoading || !profile || !account.data) {
    return (
      <SettingsScaffold title={t("settings.screens.account.title")}>
        <ActivityIndicator color={glass.lava} style={{ marginTop: 24 }} />
      </SettingsScaffold>
    );
  }

  // Remount (re-seed) whenever the server values change — e.g. after a save.
  const seedKey = `${profile.username}|${profile.displayName}|${profile.bio ?? ""}`;
  return <AccountForm key={seedKey} account={account.data} profile={profile} />;
}

function AccountForm({ account, profile }: { account: UserAccount; profile: AthleteProfile }) {
  const { t } = useTranslation();
  const updateUsername = useUpdateUsername();
  const updateProfile = useUpdateAthleteProfile();

  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");

  // Cooldown read once for this mount (form remounts after a save).
  const cooldownDaysLeft = (() => {
    if (!profile.usernameChangedAt) return 0;
    const elapsed = new Date().getTime() - new Date(profile.usernameChangedAt).getTime();
    const left = USERNAME_COOLDOWN_DAYS - Math.floor(elapsed / DAY_MS);
    return left > 0 ? left : 0;
  })();
  const usernameLocked = cooldownDaysLeft > 0;

  const availability = useUsernameAvailability(username, profile.username);

  const normalizedUsername = username.trim().toLowerCase();
  const usernameChanged = normalizedUsername !== profile.username.toLowerCase();
  const profileChanged =
    displayName.trim() !== profile.displayName || bio.trim() !== (profile.bio ?? "");
  const dirty = usernameChanged || profileChanged;

  const usernameOk =
    !usernameChanged ||
    (!usernameLocked && availability.isValid && availability.isAvailable && !availability.isChecking);

  const saving = updateUsername.isPending || updateProfile.isPending;
  const error = updateUsername.isError || updateProfile.isError;

  const status = ((): { text: string; color: string } | null => {
    if (usernameLocked)
      return { text: t("settings.screens.account.usernameCooldown", { days: cooldownDaysLeft }), color: glass.ink3 };
    if (!usernameChanged) return { text: t("settings.screens.account.usernameHint"), color: glass.ink3 };
    if (availability.isChecking) return { text: t("settings.screens.account.usernameChecking"), color: glass.ink3 };
    if (availability.errorCode === "checkError")
      return { text: t("settings.screens.account.usernameCheckError"), color: glass.lava };
    if (!availability.isValid) return { text: t("settings.screens.account.usernameHint"), color: glass.lava };
    if (!availability.isAvailable) return { text: t("settings.screens.account.usernameTaken"), color: glass.lava };
    return { text: t("settings.screens.account.usernameAvailable"), color: glass.up };
  })();

  const handleDiscard = () => {
    setUsername(profile.username);
    setDisplayName(profile.displayName);
    setBio(profile.bio ?? "");
  };

  const handleSave = async () => {
    try {
      if (usernameChanged) await updateUsername.mutateAsync(normalizedUsername);
      if (profileChanged) {
        await updateProfile.mutateAsync({ displayName: displayName.trim(), bio: bio.trim() });
      }
    } catch {
      // Error surfaced via the SaveBar; state stays dirty for a retry.
    }
  };

  return (
    <SettingsScaffold
      title={t("settings.screens.account.title")}
      subtitle={t("settings.screens.account.subtitle")}
      footer={
        <SaveBar
          dirty={dirty}
          saving={saving}
          canSave={dirty && usernameOk && !saving}
          error={error}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      }
    >
      <AvatarField
        displayName={profile.displayName}
        username={profile.username}
        email={account.email}
      />

      <View>
        <FieldLabel>{t("settings.screens.account.username")}</FieldLabel>
        <TextInput
          testID="account-username"
          value={username}
          onChangeText={(text) => setUsername(text.toLowerCase())}
          editable={!usernameLocked}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={15}
          placeholder="username"
          placeholderTextColor={glass.ink3}
          style={[inputStyle, usernameLocked && { opacity: 0.6 }]}
        />
        {status && (
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: status.color, marginTop: 6 }}>
            {status.text}
          </Text>
        )}
      </View>

      <View>
        <FieldLabel>{t("settings.screens.account.displayName")}</FieldLabel>
        <TextInput
          testID="account-display-name"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={50}
          placeholder={t("settings.screens.account.displayNamePlaceholder")}
          placeholderTextColor={glass.ink3}
          style={inputStyle}
        />
      </View>

      <View>
        <FieldLabel>{t("settings.screens.account.bio")}</FieldLabel>
        <TextInput
          testID="account-bio"
          value={bio}
          onChangeText={setBio}
          maxLength={140}
          multiline
          placeholder={t("settings.screens.account.bioPlaceholder")}
          placeholderTextColor={glass.ink3}
          style={[inputStyle, { height: 84, paddingTop: 14, textAlignVertical: "top" }]}
        />
      </View>

      <View>
        <FieldLabel>{t("settings.screens.account.email")}</FieldLabel>
        <TextInput
          testID="account-email"
          value={account.email}
          editable={false}
          style={[inputStyle, { opacity: 0.6 }]}
        />
      </View>
    </SettingsScaffold>
  );
}
