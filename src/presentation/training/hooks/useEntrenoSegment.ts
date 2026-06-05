/**
 * useEntrenoSegment — owns the Entreno landing's segment selection (Rutina ·
 * Sesiones · Ejercicios) and derives the localized option list. Keeps
 * `EntrenoScreen` thin (compose, don't hold state) per the screen-thinness rule;
 * grows here as each segment gains its own state without bloating the screen.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SegmentOption } from "../components/SegmentedControl";

export type EntrenoSegment = "routine" | "sessions" | "exercises";

export function useEntrenoSegment(initial: EntrenoSegment = "routine") {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<EntrenoSegment>(initial);

  const options: SegmentOption<EntrenoSegment>[] = [
    { key: "routine", label: t("training.segments.routine") },
    { key: "sessions", label: t("training.segments.sessions") },
    { key: "exercises", label: t("training.segments.exercises") },
  ];

  return { segment, setSegment, options };
}
