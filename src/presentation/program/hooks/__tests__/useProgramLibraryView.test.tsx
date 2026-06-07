import { renderHook, act } from "@testing-library/react-native";
import { useProgramLibraryView } from "../useProgramLibraryView";
import { programOverviewsFixture } from "@/domain/program/__fixtures__/programFixtures";

describe("useProgramLibraryView", () => {
  it("browses grouped by status when not filtering", () => {
    const { result } = renderHook(() => useProgramLibraryView(programOverviewsFixture));
    expect(result.current.filtering).toBe(false);
    expect(result.current.groups.active).toHaveLength(1);
    expect(result.current.groups.completed).toHaveLength(2);
    expect(result.current.groups.draft).toHaveLength(1);
    expect(result.current.total).toBe(4);
  });

  it("filters by search query (name / goal / description)", () => {
    const { result } = renderHook(() => useProgramLibraryView(programOverviewsFixture));
    act(() => result.current.setQuery("volumen"));
    expect(result.current.filtering).toBe(true);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].id).toBe("volumen-invierno");
  });

  it("sorts by adherence (unified score desc), nulls last", () => {
    const { result } = renderHook(() => useProgramLibraryView(programOverviewsFixture));
    act(() => result.current.setSort("adherence"));
    const scores = result.current.results.map((p) => p.unifiedExecutionScore);
    expect(scores[0]).toBe(90); // volumen-invierno
    expect(scores[scores.length - 1]).toBeNull(); // draft has no score
  });

  it("returns empty results for a non-matching query", () => {
    const { result } = renderHook(() => useProgramLibraryView(programOverviewsFixture));
    act(() => result.current.setQuery("zzz-nope"));
    expect(result.current.results).toHaveLength(0);
  });

  it("is resilient to undefined input", () => {
    const { result } = renderHook(() => useProgramLibraryView(undefined));
    expect(result.current.total).toBe(0);
    expect(result.current.results).toEqual([]);
  });
});
