import { useState } from "react";
import type { ExerciseLibrary, ExerciseLibraryItem } from "@/domain/training/models/ExerciseLibrary";

export type ExerciseSort = "name" | "logged";

/** Accent- and case-insensitive haystack for search. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * useExerciseLibraryView — the Ejercicios segment's client-side view over the
 * library read: search query, group/equipment filters, and sort, plus the
 * derived filtered list. Keeps the segment component thin and the filter logic
 * unit-testable.
 */
export function useExerciseLibraryView(library?: ExerciseLibrary) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [sort, setSort] = useState<ExerciseSort>("name");

  const exercises = library?.exercises;

  const filtered: ExerciseLibraryItem[] = (() => {
    const q = norm(query.trim());
    const out = (exercises ?? []).filter((e) => {
      if (group && e.group !== group) return false;
      if (equipment && e.equipment !== equipment) return false;
      if (q && !norm(`${e.name} ${e.muscle} ${e.equipment}`).includes(q)) return false;
      return true;
    });
    return out.sort((a, b) =>
      sort === "logged" ? b.logCount - a.logCount : a.name.localeCompare(b.name),
    );
  })();

  return {
    query,
    setQuery,
    group,
    setGroup,
    equipment,
    setEquipment,
    sort,
    setSort,
    filtered,
    facets: library?.facets,
  };
}
