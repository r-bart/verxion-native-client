import { useMemo, useState } from "react";
import type {
  RoutineLibrary,
  RoutineLibraryItem,
  RoutineLibraryState,
} from "@/domain/training/models/RoutineLibrary";

export type RoutineSort = "recent" | "name" | "adherence";

/** Accent- and case-insensitive haystack for search. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function adherence(r: RoutineLibraryItem): number {
  return r.sessionsPlanned > 0 ? r.sessionsDone / r.sessionsPlanned : 0;
}

/**
 * useRoutineLibraryView — the Rutinas screen's client-side view over the library
 * read. Two modes: when no search/filter/sort is active it exposes the routines
 * grouped by state (browse); otherwise the flat, filtered + sorted `results`.
 * Keeps the screen thin and the filter logic unit-testable.
 */
export function useRoutineLibraryView(library?: RoutineLibrary) {
  const [query, setQuery] = useState("");
  const [states, setStates] = useState<RoutineLibraryState[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [sort, setSort] = useState<RoutineSort>("recent");

  const routines = library?.routines;

  const filterCount = states.length + goals.length;
  const filtering = query.trim() !== "" || filterCount > 0 || sort !== "recent";

  const results = useMemo<RoutineLibraryItem[]>(() => {
    const q = norm(query.trim());
    const out = (routines ?? []).filter((r) => {
      if (states.length && !states.includes(r.state)) return false;
      if (goals.length && !goals.includes(r.goal)) return false;
      if (q && !norm(`${r.name} ${r.goal} ${r.split}`).includes(q))
        return false;
      return true;
    });
    if (sort === "name")
      return out.slice().sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "adherence")
      return out
        .slice()
        .sort(
          (a, b) =>
            adherence(b) - adherence(a) || a.name.localeCompare(b.name, "es")
        );
    return out; // "recent" = catalog order
  }, [routines, query, states, goals, sort]);

  const groups = useMemo(() => {
    const all = routines ?? [];
    return {
      active: all.filter((r) => r.state === "active"),
      draft: all.filter((r) => r.state === "draft"),
      paused: all.filter((r) => r.state === "paused"),
      completed: all.filter((r) => r.state === "completed"),
    };
  }, [routines]);

  const toggleState = (s: RoutineLibraryState) =>
    setStates((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleGoal = (g: string) =>
    setGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));
  const clearFilters = () => {
    setStates([]);
    setGoals([]);
  };

  return {
    query,
    setQuery,
    states,
    toggleState,
    goals,
    toggleGoal,
    sort,
    setSort,
    filterCount,
    filtering,
    clearFilters,
    results,
    groups,
    facets: library?.facets,
  };
}
