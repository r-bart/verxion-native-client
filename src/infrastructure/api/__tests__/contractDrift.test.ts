import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

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

// (method, /api/v1 path) pairs the hand-written repositories call, grouped by
// module. Path params use the spec's `{param}` template form (repos build the
// concrete URLs from these at runtime). Extend a module's list as its repo grows.
const ENDPOINTS: Record<string, [string, string][]> = {
  settings: [
    ["GET", "/api/v1/users/me"],
    ["PUT", "/api/v1/users/me"],
    ["PUT", "/api/v1/users/me/preferences"],
    ["DELETE", "/api/v1/users/me"],
    ["POST", "/api/v1/users/me/export"],
    ["GET", "/api/v1/users/me/export/latest"],
    ["GET", "/api/v1/users/me/export/{id}"],
    ["GET", "/api/v1/profiles/me"],
    ["PUT", "/api/v1/profiles/me"],
    ["PUT", "/api/v1/profiles/me/username"],
    ["POST", "/api/v1/profiles/me/avatar"],
    ["DELETE", "/api/v1/profiles/me/avatar"],
    ["PUT", "/api/v1/profiles/me/visibility"],
    ["PUT", "/api/v1/profiles/me/showcase"],
    ["PUT", "/api/v1/profiles/me/timeline-detail"],
    ["PUT", "/api/v1/profiles/me/follow-approval"],
    ["GET", "/api/v1/profiles/me/feed-sharing"],
    ["PUT", "/api/v1/profiles/me/feed-sharing"],
    ["GET", "/api/v1/auth-sessions"],
    ["DELETE", "/api/v1/auth-sessions/{id}"],
    ["POST", "/api/v1/auth-sessions/revoke-all"],
    ["GET", "/api/v1/auth-sessions/apps"],
    ["DELETE", "/api/v1/auth-sessions/apps/{clientId}"],
    ["PATCH", "/api/v1/auth-sessions/apps/{clientId}/scopes"],
  ],
  today: [
    ["GET", "/api/v1/today"],
    ["GET", "/api/v1/today/timeline/{kind}/{id}"],
  ],
  training: [
    // Entreno landing "Rutina" aggregate — live read-model the repo calls.
    ["GET", "/api/v1/training/routine-dashboard"],
    // Entreno landing "Sesiones" feed — live read-model behind getSessionFeed.
    ["GET", "/api/v1/training/sessions-feed"],
    // "Detalle de sesión" report — live read-model behind getSessionDetailView.
    ["GET", "/api/v1/sessions/{id}/detail"],
  ],
  nutrition: [
    // Nutrición landing "Plan" aggregate — live read-model behind getDietDashboard.
    ["GET", "/api/v1/nutrition/diet-dashboard"],
    // "Dietas" library — curated read-model behind getDietLibrary.
    ["GET", "/api/v1/nutrition/diet-library"],
    // "Detalle de dieta" — curated read-model behind getDietDetail.
    ["GET", "/api/v1/nutrition/diet-detail/{planId}"],
    // "Detalle de comida" — curated read-model behind getMealDetail.
    ["GET", "/api/v1/nutrition/meal-detail/{planId}/{mealId}"],
    // "Detalle de alimento" — curated read-model behind getFoodDetail.
    ["GET", "/api/v1/nutrition/food-detail/{kind}/{id}"],
    // "Plan de comidas del día" — curated read-model behind getDietDayPlan.
    ["GET", "/api/v1/nutrition/diet-day-plan"],
    // "Diario" — curated read-model behind getDiaryFeed.
    ["GET", "/api/v1/nutrition/diary-feed"],
    // "Detalle de día del diario" — curated read-model behind getDiaryDay.
    ["GET", "/api/v1/nutrition/diary-day/{date}"],
    // "Alimentos" — curated read-model behind getFoodLibrary.
    ["GET", "/api/v1/nutrition/food-library"],
  ],
  onboarding: [
    ["GET", "/api/v1/users/me"],
    ["GET", "/api/v1/users/check-username/{username}"],
    ["POST", "/api/v1/users/onboard"],
  ],
};

const ROWS: [string, string, string][] = Object.entries(ENDPOINTS).flatMap(
  ([module, eps]) =>
    eps.map(
      ([method, path]) => [module, method, path] as [string, string, string]
    )
);

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
  });
});
