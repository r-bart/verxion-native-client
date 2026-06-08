import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import type { PrivacyExportStatus } from "@/domain/settings";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { inputStyle } from "@/presentation/_shared/components/Field";
import { formatRelativeTime } from "@/presentation/_shared/lib/relativeTime";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useLatestExport, useRequestExport } from "../hooks/useDataExport";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Tone = "muted" | "warning" | "success" | "error";
const STATUS_TONE: Record<PrivacyExportStatus | "idle", Tone> = {
  idle: "muted",
  requested: "warning",
  processing: "warning",
  ready: "success",
  downloaded: "muted",
  expired: "error",
  failed: "error",
};
const TONE_COLOR: Record<Tone, string> = {
  muted: glass.ink2,
  warning: glass.lava,
  success: glass.up,
  error: glass.lava,
};
const STATUS_LABEL: Record<PrivacyExportStatus | "idle", string> = {
  idle: "settings.screens.data.statusIdle",
  requested: "settings.screens.data.statusRequested",
  processing: "settings.screens.data.statusProcessing",
  ready: "settings.screens.data.statusReady",
  downloaded: "settings.screens.data.statusDownloaded",
  expired: "settings.screens.data.statusExpired",
  failed: "settings.screens.data.statusFailed",
};

export function DataScreen() {
  const { t, i18n } = useTranslation();
  const latest = useLatestExport();
  const requestExport = useRequestExport();
  const deleteAccount = useDeleteAccount();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const job = latest.data ?? null;
  const status: PrivacyExportStatus | "idle" = job?.status ?? "idle";
  const deleteWord = t("settings.screens.data.deleteConfirmWord");

  return (
    <SettingsScaffold
      title={t("settings.screens.data.title")}
      subtitle={t("settings.screens.data.subtitle")}
    >
      {/* Export */}
      <GlassSurface radius={18} style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white }}>
            {t("settings.screens.data.exportTitle")}
          </Text>
          {latest.isLoading ? (
            <SkeletonBlock height={22} width={84} radius={9999} />
          ) : (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 9999,
                backgroundColor: glass.fill,
                borderWidth: 1,
                borderColor: glass.stroke,
              }}
              testID="export-status"
            >
              <Text style={{ fontFamily: sans(600), fontSize: 11, color: TONE_COLOR[STATUS_TONE[status]] }}>
                {t(STATUS_LABEL[status])}
              </Text>
            </View>
          )}
        </View>

        <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink2 }}>
          {t("settings.screens.data.exportBody")}
        </Text>

        {job && (
          <View style={{ gap: 2 }}>
            {job.requestedAt && (
              <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
                {t("settings.screens.data.requestedAt", { time: formatRelativeTime(job.requestedAt, i18n.language) })}
              </Text>
            )}
            {job.expiresAt && (
              <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
                {t("settings.screens.data.expiresAt", { time: formatRelativeTime(job.expiresAt, i18n.language) })}
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: 10 }}>
          <OnboardingButton
            label={t("settings.screens.data.requestExport")}
            loading={requestExport.isPending}
            onPress={() => requestExport.mutate()}
            testID="request-export"
          />
          <OnboardingButton
            label={t("settings.screens.data.refreshStatus")}
            variant="secondary"
            loading={latest.isFetching}
            disabled={!job}
            onPress={() => latest.refetch()}
            testID="refresh-export"
          />
        </View>

        {status === "ready" && (
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink3 }}>
            {t("settings.screens.data.downloadHint")}
          </Text>
        )}
        {requestExport.isError && (
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.lava }}>
            {t("settings.screens.data.exportError")}
          </Text>
        )}
      </GlassSurface>

      {/* Delete account */}
      <GlassSurface
        radius={18}
        bordered={false}
        fallbackFill={glass.lavaBg}
        style={{ padding: 16, gap: 10, borderWidth: 1, borderColor: glass.lavaBorder }}
      >
        <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.lava }}>
          {t("settings.screens.data.deleteTitle")}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink2 }}>
          {t("settings.screens.data.deleteBody")}
        </Text>
        <OnboardingButton
          label={t("settings.screens.data.deleteButton")}
          onPress={() => {
            setConfirmText("");
            setConfirmDelete(true);
          }}
          testID="delete-account"
        />
      </GlassSurface>

      <ConfirmDialog
        visible={confirmDelete}
        title={t("settings.screens.data.deleteConfirmTitle")}
        message={t("settings.screens.data.deleteConfirmBody", { word: deleteWord })}
        confirmLabel={t("settings.screens.data.deleteButton")}
        loading={deleteAccount.isPending}
        confirmDisabled={confirmText.trim().toUpperCase() !== deleteWord.toUpperCase()}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteAccount.mutate()}
        testID="confirm-delete"
      >
        <TextInput
          testID="delete-confirm-input"
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={t("settings.screens.data.deleteConfirmPlaceholder")}
          placeholderTextColor={glass.ink3}
          style={inputStyle}
        />
      </ConfirmDialog>
    </SettingsScaffold>
  );
}
