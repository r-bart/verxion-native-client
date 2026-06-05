/**
 * EjercicioScreen — the full history of a movement (e1RM/volume curve, history,
 * muscles, how-to). Opened from a day, a session report, or the exercise
 * library; the native stack back returns to the origin. Phase 0: scaffold.
 */
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { DetailScaffold } from "../components/DetailScaffold";
import { WipBody } from "../components/WipBody";

export function EjercicioScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <DetailScaffold title={t("training.screens.exercise")}>
      <WipBody screen={t("training.screens.exercise")} params={{ id }} />
    </DetailScaffold>
  );
}
