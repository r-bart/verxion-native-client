import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { flattenContractEndpoints } from "../../../../scripts/contract-endpoints";

/**
 * Contract drift guard — asserts that the platform endpoints our hand-written
 * repositories depend on still exist (and that a few shape invariants we rely on
 * hold) in the committed OpenAPI snapshot.
 *
 * The native client mirrors `/api/v1` by hand, so the contract is where bugs
 * actually originate here (a removed route, a renamed field, an envelope shape).
 * This catches that class of drift in Jest, before the simulator.
 *
 * The contract lives in the SIBLING platform repo
 * (`../verxion-platform/contracts/<env>.openapi.json`). When that repo isn't
 * checked out alongside this one (e.g. CI, which only clones native), the file
 * is absent and the suite SKIPS rather than fails — it's a local/integration
 * drift guard, not a hard CI gate. Run it wherever you run `integrate-endpoint`.
 */
const CONTRACTS_DIR = resolve(process.cwd(), "../verxion-platform/contracts");
// develop is the freshest (drift-guarded upstream); fall back to staging.
const CONTRACT_FILE = ["develop.openapi.json", "staging.openapi.json"]
  .map((f) => resolve(CONTRACTS_DIR, f))
  .find((p) => existsSync(p));

type Spec = {
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, any> };
};
const spec: Spec | null = CONTRACT_FILE
  ? (JSON.parse(readFileSync(CONTRACT_FILE, "utf8")) as Spec)
  : null;

if (!spec) {
  console.warn(
    "[contract-drift] ../verxion-platform/contracts not found — skipping drift guard."
  );
}

const ROWS = flattenContractEndpoints();

const describeIfContract = spec ? describe : describe.skip;

describeIfContract("contract drift — native repositories", () => {
  it("validates against a committed contract snapshot", () => {
    expect(CONTRACT_FILE).toBeTruthy();
  });

  it.each(ROWS)(
    "%s · %s %s exists in the contract",
    (_module, method, path) => {
      const entry = spec!.paths[path];
      expect(entry).toBeDefined();
      expect(entry?.[method.toLowerCase()]).toBeDefined();
    }
  );

  describe("shape invariants the repos rely on", () => {
    it("GET /profiles/me signals 'no profile' with 404 (not 204)", () => {
      const responses = (spec!.paths["/api/v1/profiles/me"].get as any)
        .responses;
      expect(responses["404"]).toBeDefined();
      expect(responses["204"]).toBeUndefined();
    });

    it("UserProfileResponse exposes appPreferences.language (drives §8.3 reconcile)", () => {
      const prefs =
        spec!.components.schemas.UserProfileResponse?.properties?.preferences;
      expect(prefs?.properties?.language).toBeDefined();
    });

    it("responses use the { data } envelope (apiClient unwraps it)", () => {
      const schema = (spec!.paths["/api/v1/users/me"].get as any).responses[
        "200"
      ].content["application/json"].schema;
      expect(schema.properties?.data).toBeDefined();
    });

    it("DietLibrary carries diets[] + facets the screen groups/filters by", () => {
      const lib = spec!.components.schemas.DietLibrary?.properties;
      const diet = lib?.diets?.items?.properties;
      // fields the card/row + client-side sort rely on
      expect(diet?.state?.enum).toEqual(
        expect.arrayContaining(["active", "completed"])
      );
      expect(diet?.targets?.properties?.kcal).toBeDefined();
      expect(diet?.proteinGoal).toBeDefined();
      expect(diet?.adherence).toBeDefined();
      // facets that drive the filter sheet
      expect(lib?.facets?.properties?.states).toBeDefined();
      expect(lib?.facets?.properties?.goals).toBeDefined();
    });

    it("SessionFeedPage stays raw — block.totalVolume + session.volume are { value, unit }", () => {
      const block =
        spec!.components.schemas.SessionFeedPage?.properties?.blocks?.items;
      expect(block?.properties?.totalVolume?.properties?.value).toBeDefined();
      const session = block?.properties?.sessions?.items;
      expect(session?.properties?.volume?.properties?.value).toBeDefined();
      // raw fields the repo passes through unmapped (presentation formats them)
      expect(session?.properties?.completedAt).toBeDefined();
      expect(session?.properties?.durationSeconds).toBeDefined();
    });

    // Tripwire for the 2026-06 evolutivo that REMOVED the "pace" concept
    // (`scoreState` / `adherenceState`, the "Vas adelantado" chip) from every
    // read-model. The client dropped the field + `ScoreChip`. If develop ever
    // re-adds these, this fails so we revisit whether to bring the chip back —
    // the rest of the suite only catches fields that *vanish*, not ones that
    // *reappear*. Staging still carries them, so only assert on develop.
    it("pace fields stay removed on develop (scoreState / adherenceState)", () => {
      if (!CONTRACT_FILE?.endsWith("develop.openapi.json")) {
        console.warn(
          "[contract-drift] not on develop — skipping pace-removal tripwire"
        );
        return;
      }
      const props = (name: string) =>
        spec!.components.schemas[name]?.properties ?? {};
      expect(props("ActiveRoutineSummary").scoreState).toBeUndefined();
      expect(props("RoutineLibraryItem").scoreState).toBeUndefined();
      expect(props("ActiveDietSummary").scoreState).toBeUndefined();
      expect(props("DietDetail").scoreState).toBeUndefined();
      expect(props("DietLibraryItem").scoreState).toBeUndefined();
      expect(props("ProgramOverview").adherenceState).toBeUndefined();
    });

    // Periodization (mesocycles) context the client now paints — shipped 2026-06.
    // The block header (Entreno landing + routine detail) reads
    // `ActiveRoutineSummary.mesocycle`; the session-detail chip reads the FROZEN
    // `WorkoutSessionDetail.session.mesocycle`. If either field/shape is dropped,
    // the block header / chip silently vanish — catch it here before the sim.
    it("periodization mesocycle context stays on the read-models the client paints", () => {
      const s = spec!.components.schemas;
      // Active block (dashboard + routine detail header)
      const active = s.ActiveMesocycle?.properties;
      expect(s.ActiveRoutineSummary?.properties?.mesocycle).toBeDefined();
      expect(active?.name).toBeDefined();
      expect(active?.orderIndex).toBeDefined();
      expect(active?.totalBlocks).toBeDefined();
      expect(active?.isLastWeek).toBeDefined();
      expect(active?.isLastBlock).toBeDefined();
      // Frozen block per completed session (session-detail chip "Acumulación · Sem 4/4")
      const frozen = s.SessionMesocycle?.properties;
      expect(
        s.WorkoutSessionDetail?.properties?.session?.properties?.mesocycle
      ).toBeDefined();
      expect(frozen?.name).toBeDefined();
      expect(frozen?.orderIndex).toBeDefined();
      expect(frozen?.totalBlocks).toBeDefined();
      expect(frozen?.week).toBeDefined(); // 1-based microcycle
      expect(frozen?.weeks).toBeDefined(); // block durationWeeks
      // Today aggregate surfaces the SAME active block on the routine row
      // (ActivePlan eyebrow "RUTINA · ACUMULACIÓN"). Same shape as the dashboard.
      expect(s.RoutineProgress?.properties?.mesocycle).toBeDefined();
    });

    it("Progress read-models expose the fields the 4 lenses paint", () => {
      const s = spec!.components.schemas;
      // Overview (Resumen + Métricas)
      const overview = s.ProgressOverview?.properties;
      expect(overview?.metrics?.items?.properties?.spark).toBeDefined();
      expect(overview?.metrics?.items?.properties?.goodDown).toBeDefined();
      expect(overview?.strengthPr).toBeDefined();
      expect(overview?.setup?.properties?.routine).toBeDefined();
      expect(overview?.dataState?.enum).toEqual(
        expect.arrayContaining(["full", "fresh", "empty"])
      );
      // History (Cinta / Carrete): 3 lanes + phase bands + PR marks
      const history = s.ProgressHistory?.properties;
      expect(history?.series?.items?.properties?.points).toBeDefined();
      expect(history?.bands?.items?.properties?.isMajor).toBeDefined();
      expect(history?.prMarks?.items?.properties?.slug).toBeDefined();
      // Measure detail: hero window + chart + records (deltaPrev)
      const measure = s.ProgressMeasureDetail?.properties;
      expect(measure?.window?.properties?.now).toBeDefined();
      expect(measure?.chart?.items?.properties?.value).toBeDefined();
      expect(measure?.records?.items?.properties?.deltaPrev).toBeDefined();
      // Exercise detail (tab Progreso): kpis + curve + history + muscles
      const ex = s.ProgressExerciseDetail?.properties;
      expect(ex?.kpis?.properties?.e1rmKg).toBeDefined();
      expect(ex?.curve?.items?.properties?.value).toBeDefined();
      expect(ex?.history?.items?.properties?.isPr).toBeDefined();
      expect(ex?.muscles?.items?.properties?.role).toBeDefined();
    });

    it("Progress lenses declare the period/metric selectors (gap G — landed)", () => {
      const param = (path: string, name: string) =>
        ((spec!.paths[path].get as any).parameters ?? []).find(
          (p: any) => p.name === name
        );
      expect(param("/api/v1/progress", "period")?.schema?.enum).toEqual(
        expect.arrayContaining(["semana", "mes", "trim", "sem6", "ano"])
      );
      expect(
        param("/api/v1/progress/measure/{metric}", "period")?.schema?.enum
      ).toEqual(expect.arrayContaining(["mes", "trim", "ano"]));
      expect(
        param("/api/v1/progress/exercise/{slug}", "metric")?.schema?.enum
      ).toEqual(expect.arrayContaining(["e1rm", "volumen"]));
    });

    // The agreed backend follow-up landed (same cascade as gap G): bands carry
    // `name` + `why` (the "versiones de ti" chapters of the Carrete) and
    // ProgressExerciseDetail carries `id` (the slug→library bridge for the guide
    // tab). Lock them in so a regression that drops them fails here. `why` is
    // nullable (plan without a description). See progress-screen-spec.md §5.A/D.
    it("Historial narrative + exercise→library bridge are live (name/why/id)", () => {
      const band = spec!.components.schemas.ProgressHistory?.properties?.bands
        ?.items?.properties;
      const ex = spec!.components.schemas.ProgressExerciseDetail?.properties;
      expect(band?.name).toBeDefined();
      expect(band?.why?.type).toEqual(expect.arrayContaining(["string", "null"]));
      expect(ex?.id).toBeDefined();
    });
  });
});
