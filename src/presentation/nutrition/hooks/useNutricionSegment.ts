/**
 * useNutricionSegment — owns the Nutrición landing's segment selection (Plan ·
 * Diario · Alimentos) and derives the localized option list. Keeps
 * `NutricionScreen` thin per the screen-thinness rule; mirror of
 * `useEntrenoSegment`.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SegmentOption } from "@/presentation/_shared/components/SegmentedControl";

export type NutricionSegment = "plan" | "diario" | "alimentos";

export function useNutricionSegment(initial: NutricionSegment = "plan") {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<NutricionSegment>(initial);

  const options: SegmentOption<NutricionSegment>[] = [
    { key: "plan", label: t("nutrition.segments.plan") },
    { key: "diario", label: t("nutrition.segments.diario") },
    { key: "alimentos", label: t("nutrition.segments.alimentos") },
  ];

  return { segment, setSegment, options };
}
