import { useState } from "react";
import type { ProgramOverview } from "@/domain/program/models/Program";

export type ProgramSort = "recent" | "name" | "adherence";

/** Accent- and case-insensitive haystack for search. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * useProgramLibraryView — the Programas screen's client-side view over the one
 * library read. Browse mode (no search, sort = recent) exposes programs grouped
 * by state; otherwise the flat, filtered + sorted `results`. Mirrors the handoff
 * `pgFilterSort` + groups; keeps the screen thin and the logic unit-testable.
 */
export function useProgramLibraryView(programs?: ProgramOverview[]) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProgramSort>("recent");

  const all = programs ?? [];
  const filtering = query.trim() !== "" || sort !== "recent";

  const byName = (a: ProgramOverview, b: ProgramOverview) =>
    a.name.localeCompare(b.name, "es");

  const results: ProgramOverview[] = (() => {
    const q = norm(query.trim());
    const out = all.filter((p) => {
      if (!q) return true;
      return norm(`${p.name} ${p.goal ?? ""} ${p.description ?? ""}`).includes(q);
    });
    if (sort === "name") return out.slice().sort(byName);
    if (sort === "adherence")
      return out
        .slice()
        .sort(
          (a, b) =>
            (b.unifiedExecutionScore ?? 0) - (a.unifiedExecutionScore ?? 0) ||
            byName(a, b),
        );
    return out; // "recent" = catalog order
  })();

  const groups = {
    active: all.filter((p) => p.status === "active"),
    paused: all.filter((p) => p.status === "paused"),
    draft: all.filter((p) => p.status === "draft"),
    completed: all.filter((p) => p.status === "completed"),
  };

  return { query, setQuery, sort, setSort, filtering, results, groups, total: all.length };
}
