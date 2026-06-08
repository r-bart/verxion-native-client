/**
 * useProgresoSegment — owns the Progreso landing's lens selection (Resumen ·
 * Métricas · Historial) and derives the localized option list. Keeps
 * `ProgresoScreen` thin per the screen-thinness rule; grows here as each lens
 * gains its own view-state without bloating the screen.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SegmentOption } from "@/presentation/_shared/components/SegmentedControl";

export type ProgresoSegment = "resumen" | "metricas" | "historial";

export function useProgresoSegment(initial: ProgresoSegment = "resumen") {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<ProgresoSegment>(initial);

  const options: SegmentOption<ProgresoSegment>[] = [
    { key: "resumen", label: t("progress.segments.resumen") },
    { key: "metricas", label: t("progress.segments.metricas") },
    { key: "historial", label: t("progress.segments.historial") },
  ];

  return { segment, setSegment, options };
}
