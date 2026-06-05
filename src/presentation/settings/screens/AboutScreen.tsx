import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { FileText, Shield, LifeBuoy, ScrollText } from "lucide-react-native";
import { useDI } from "@/infrastructure/di/DIContext";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";

const TERMS_URL = "https://verxion.ai/terms";
const PRIVACY_URL = "https://verxion.ai/privacy";
const SUPPORT_URL = "mailto:hello@verxion.ai";

export function AboutScreen() {
  const { t } = useTranslation();
  const appVersion = useDI((c) => c.appInfo.version);

  const open = (url: string) => () => {
    void Linking.openURL(url);
  };

  return (
    <SettingsScaffold title={t("settings.screens.about.title")}>
      <SettingsSection>
        <SettingsRow label={t("settings.screens.about.version")} value={appVersion} testID="about-version" />
      </SettingsSection>

      <SettingsSection>
        <SettingsRow
          label={t("settings.screens.about.terms")}
          icon={FileText}
          onPress={open(TERMS_URL)}
          testID="about-terms"
        />
        <SettingsRow
          label={t("settings.screens.about.privacy")}
          icon={Shield}
          onPress={open(PRIVACY_URL)}
          testID="about-privacy"
        />
        <SettingsRow
          label={t("settings.screens.about.support")}
          icon={LifeBuoy}
          onPress={open(SUPPORT_URL)}
          testID="about-support"
        />
        <SettingsRow
          label={t("settings.screens.about.licenses")}
          icon={ScrollText}
          onPress={open("https://verxion.ai/licenses")}
          testID="about-licenses"
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}
