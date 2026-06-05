/**
 * ExerciseLibrary — the read aggregate behind the Entreno landing's "Ejercicios"
 * segment: the user's exercise catalogue with per-exercise training status, plus
 * the facets the filter sheet offers. The list is browsed read-only; search,
 * filter and sort run client-side over this one read.
 *
 * CONTRACT proposal for the platform. Proposed endpoint:
 * `GET /training/exercise-library`.
 */
import type { DayType } from "./RoutineDashboard";

/** Exercises group under the same push/pull/legs/core vocabulary as days. */
export type ExercisePart = Exclude<DayType, "rest">;

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  /** Primary target muscle (e.g. "Pecho"). */
  muscle: string;
  /** Broad muscle group used by the filter facet (e.g. "Pecho", "Espalda"). */
  group: string;
  equipment: string;
  part: ExercisePart;
  /** Formatted personal record (e.g. "82,5 kg"), or null if none yet. */
  prLabel: string | null;
  /** How many times the user has logged this movement. */
  logCount: number;
  isCustom: boolean;
}

export interface ExerciseLibraryFacets {
  groups: string[];
  equipment: string[];
}

export interface ExerciseLibrary {
  exercises: ExerciseLibraryItem[];
  facets: ExerciseLibraryFacets;
}
