export type ContractHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ContractEndpointPath = `/api/v1/${string}`;

export type ContractEndpointGroup = readonly (readonly [
  method: ContractHttpMethod,
  path: ContractEndpointPath,
])[];

// Shared inventory of live apiClient calls in production repositories.
// Query strings are omitted; dynamic segments use OpenAPI path templates.
export const CONTRACT_ENDPOINTS = {
  settings: [
    ["GET", "/api/v1/users/me"],
    ["PUT", "/api/v1/users/me"],
    ["PUT", "/api/v1/users/me/preferences"],
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
    ["POST", "/api/v1/users/me/export"],
    ["GET", "/api/v1/users/me/export/latest"],
    ["GET", "/api/v1/users/me/export/{id}"],
    ["DELETE", "/api/v1/users/me"],
  ],
  today: [
    ["GET", "/api/v1/today"],
    ["GET", "/api/v1/today/timeline/{kind}/{id}"],
  ],
  training: [
    ["GET", "/api/v1/training/routine-dashboard"],
    ["GET", "/api/v1/training/sessions-feed"],
    ["GET", "/api/v1/sessions/{id}/detail"],
  ],
  nutrition: [
    ["GET", "/api/v1/nutrition/diet-dashboard"],
    ["GET", "/api/v1/nutrition/diet-library"],
    ["GET", "/api/v1/nutrition/diet-detail/{planId}"],
    ["GET", "/api/v1/nutrition/meal-detail/{planId}/{mealId}"],
    ["GET", "/api/v1/nutrition/food-detail/{kind}/{id}"],
    ["GET", "/api/v1/nutrition/diet-day-plan"],
    ["GET", "/api/v1/nutrition/diary-feed"],
    ["GET", "/api/v1/nutrition/diary-day/{date}"],
    ["GET", "/api/v1/nutrition/logs/daily/{date}"],
    ["GET", "/api/v1/nutrition/food-library"],
    ["GET", "/api/v1/nutrition/analytics/day-state"],
    ["GET", "/api/v1/nutrition/analytics/weekly-summary"],
  ],
  onboarding: [
    ["GET", "/api/v1/users/me"],
    ["GET", "/api/v1/users/check-username/{username}"],
    ["POST", "/api/v1/users/onboard"],
  ],
  program: [
    ["GET", "/api/v1/programs"],
    ["GET", "/api/v1/programs/active"],
    ["GET", "/api/v1/programs/{id}"],
    ["GET", "/api/v1/programs/{id}/adherence"],
  ],
  progress: [
    ["GET", "/api/v1/progress"],
    ["GET", "/api/v1/progress/history"],
    ["GET", "/api/v1/progress/measure/{metric}"],
    ["GET", "/api/v1/progress/exercise/{slug}"],
  ],
  activity: [
    ["GET", "/api/v1/activity/steps"],
    ["POST", "/api/v1/activity/steps"],
    ["GET", "/api/v1/nutrition/water/daily/{date}"],
    ["POST", "/api/v1/nutrition/water"],
  ],
  analytics: [
    ["GET", "/api/v1/analytics/streaks"],
    ["GET", "/api/v1/analytics/week-view"],
    ["GET", "/api/v1/analytics/contribution-grid"],
    ["GET", "/api/v1/analytics/training/day-state"],
    ["GET", "/api/v1/analytics/training/execution-score"],
    ["GET", "/api/v1/analytics/training/suggest-next"],
    ["GET", "/api/v1/analytics/weekly-review/training"],
  ],
  measurements: [["POST", "/api/v1/measurements/weight"]],
  // Apple Health → platform sync (HttpHealthSyncRepository). Weight POST is shared
  // with the `measurements` row above; the rest are sync-only ingestion routes.
  healthSync: [
    ["POST", "/api/v1/activity/cardio"],
    ["POST", "/api/v1/activity/steps/upsert"],
    ["DELETE", "/api/v1/measurements/weight/by-external/{source}/{externalId}"],
    ["DELETE", "/api/v1/activity/cardio/by-external/{source}/{externalId}"],
  ],
  sessions: [
    ["GET", "/api/v1/sessions"],
    ["GET", "/api/v1/sessions/{id}/live-progress"],
    ["GET", "/api/v1/sessions/reports"],
  ],
  exerciseCatalog: [
    ["GET", "/api/v1/exercises"],
    ["GET", "/api/v1/exercises/{id}"],
    ["GET", "/api/v1/exercises/filters"],
  ],
  rawRoutines: [
    ["GET", "/api/v1/routines"],
    ["GET", "/api/v1/routines/{id}"],
    ["GET", "/api/v1/routines/{id}/days"],
    ["GET", "/api/v1/routines/{id}/days/{dayId}/exercises"],
    ["GET", "/api/v1/routines/day-exercises/{id}/configuration"],
    ["GET", "/api/v1/sessions/progression-plan"],
  ],
} as const satisfies Record<string, ContractEndpointGroup>;

export type ContractEndpointGroupName = keyof typeof CONTRACT_ENDPOINTS;

export type ContractEndpointRow = readonly [
  module: ContractEndpointGroupName,
  method: ContractHttpMethod,
  path: ContractEndpointPath,
];

export function flattenContractEndpoints(
  endpoints: typeof CONTRACT_ENDPOINTS = CONTRACT_ENDPOINTS
): ContractEndpointRow[] {
  return (Object.keys(endpoints) as ContractEndpointGroupName[]).flatMap((module) =>
    endpoints[module].map(
      ([method, path]) => [module, method, path] satisfies ContractEndpointRow
    )
  );
}
