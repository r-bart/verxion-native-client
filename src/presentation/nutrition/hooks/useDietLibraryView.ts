import { useState } from "react";
import type {
  DietLibrary,
  DietLibraryItem,
  DietLibraryState,
} from "@/domain/nutrition/models/DietLibrary";

export type DietSort = "recent" | "name" | "adherence" | "kcal";

/** Accent- and case-insensitive haystack for search. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * useDietLibraryView — the Dietas screen's client-side view over the library
 * read. Two modes: with no search/filter/sort active it exposes the diets grouped
 * by state (browse); otherwise the flat, filtered + sorted `results`. Keeps the
 * screen thin and the filter logic unit-testable. Nutrition mirror of
 * `useRoutineLibraryView`.
 */
export function useDietLibraryView(library?: DietLibrary) {
  const [query, setQuery] = useState("");
  const [states, setStates] = useState<DietLibraryState[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [sort, setSort] = useState<DietSort>("recent");

  const diets = library?.diets;

  const filterCount = states.length + goals.length;
  const filtering = query.trim() !== "" || filterCount > 0 || sort !== "recent";

  const results: DietLibraryItem[] = (() => {
    const q = norm(query.trim());
    const out = (diets ?? []).filter((d) => {
      if (states.length && !states.includes(d.state)) return false;
      if (goals.length && (d.goal == null || !goals.includes(d.goal)))
        return false;
      if (q && !norm(`${d.name} ${d.goal ?? ""}`).includes(q)) return false;
      return true;
    });
    if (sort === "name")
      return out.slice().sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "adherence")
      return out
        .slice()
        .sort(
          (a, b) =>
            (b.adherence ?? 0) - (a.adherence ?? 0) ||
            a.name.localeCompare(b.name, "es")
        );
    if (sort === "kcal")
      return out
        .slice()
        .sort(
          (a, b) =>
            b.targets.kcal - a.targets.kcal ||
            a.name.localeCompare(b.name, "es")
        );
    return out; // "recent" = catalog order
  })();

  const all = diets ?? [];
  const groups = {
    active: all.filter((d) => d.state === "active"),
    draft: all.filter((d) => d.state === "draft"),
    paused: all.filter((d) => d.state === "paused"),
    completed: all.filter((d) => d.state === "completed"),
  };

  const toggleState = (s: DietLibraryState) =>
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
