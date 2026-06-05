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
  // eslint-disable-next-line no-console
  console.warn(
    "[contract-drift] ../verxion-platform/contracts not found — skipping drift guard.",
  );
}

// (method, /api/v1 path) pairs the repositories call. Path params use the spec's
// `{param}` template form (repos build concrete URLs from these at runtime).
const SETTINGS_ENDPOINTS: [string, string][] = [
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
];

const describeIfContract = spec ? describe : describe.skip;

describeIfContract("contract drift — settings module", () => {
  it("validates against a committed contract snapshot", () => {
    expect(CONTRACT_FILE).toBeTruthy();
  });

  it.each(SETTINGS_ENDPOINTS)("%s %s exists in the contract", (method, path) => {
    const entry = spec!.paths[path];
    expect(entry).toBeDefined();
    expect(entry?.[method.toLowerCase()]).toBeDefined();
  });

  describe("shape invariants the repos rely on", () => {
    it("GET /profiles/me signals 'no profile' with 404 (not 204)", () => {
      const responses = (spec!.paths["/api/v1/profiles/me"].get as any).responses;
      expect(responses["404"]).toBeDefined();
      expect(responses["204"]).toBeUndefined();
    });

    it("UserProfileResponse exposes appPreferences.language (drives §8.3 reconcile)", () => {
      const prefs = spec!.components.schemas.UserProfileResponse?.properties?.preferences;
      expect(prefs?.properties?.language).toBeDefined();
    });

    it("responses use the { data } envelope (apiClient unwraps it)", () => {
      const schema = (spec!.paths["/api/v1/users/me"].get as any).responses["200"]
        .content["application/json"].schema;
      expect(schema.properties?.data).toBeDefined();
    });
  });
});
