/**
 * SesionScreen — the live session. The agent registers it set-by-set via MCP;
 * the client only reads and refreshes live progress (no writes here). Phase 0:
 * scaffold placeholder.
 */
import { useTranslation } from "react-i18next";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function SesionScreen() {
  const { t } = useTranslation();
  return (
    <DetailScaffold title={t("training.screens.liveSession")}>
      <WipBody screen={t("training.screens.liveSession")} />
    </DetailScaffold>
  );
}
