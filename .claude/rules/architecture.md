# Architecture Rules — Clean Architecture + DDD

These rules are **non-negotiable**. Every file must respect layer boundaries and dependency direction.

## Layer Structure

```
src/
  domain/                    # Layer 0 — Pure types, no dependencies
    {module}/
      models/                # TypeScript interfaces/types for domain entities
      ports/                 # Repository interfaces (what the domain expects)
      index.ts               # Public API barrel export

  application/               # Layer 1 — Depends on domain only
    {module}/
      {ActionName}UseCase.ts # One class per operation, injected port via constructor
      index.ts               # Barrel export

  infrastructure/            # Layer 2 — Implements domain ports
    api/
      apiClient.ts           # HTTP fetch wrapper (base URL, auth headers, error handling)
    repositories/
      Http{Module}Repository.ts  # Implements domain port, calls apiClient
    di/
      container.ts           # Wires repos → UCs, exports Container type
      DIContext.tsx           # React Context + useDI hook
    auth/
      authClient.ts          # Better Auth expo client
    i18n/
      i18n.ts                # react-i18next setup

  presentation/              # Layer 3 — UI, depends on domain (types) + DI (UCs)
    _shared/
      components/
        ui/                  # react-native-reusables components (Button, Card, Badge...)
        MetricCard.tsx        # App-wide shared components
        ChartCard.tsx
        PeriodSelector.tsx
        EmptyState.tsx
      hooks/                 # Shared hooks (useRefreshOnFocus, etc.)
    {feature}/
      screens/
        {Screen}.tsx          # Screen component (composes state + module)
      components/
        {Component}.tsx       # Feature-specific UI components
      hooks/
        use{Something}.ts     # TanStack Query hooks that call UCs via useDI
      keys.ts                 # Query key factory for this feature

app/                          # Expo Router — routes only, NO logic
  (auth)/
    login.tsx                 # Renders presentation/auth/screens/LoginScreen
    signup.tsx
  (tabs)/
    today/
      index.tsx               # Renders presentation/today/screens/TodayScreen
    progress/
      _layout.tsx
      index.tsx               # Renders presentation/progress/screens/OverviewScreen
      body-composition.tsx
      exercises.tsx
      ...
  modals/
    log-weight.tsx
    log-water.tsx
    log-steps.tsx
```

## Dependency Direction (STRICT)

```
domain  ←  application  ←  infrastructure
                              ↑
                         presentation
```

### What each layer CAN import

| Layer | Can import from |
|-------|----------------|
| `domain/` | Nothing. Only standard library types and `@verxion/shared` response types |
| `application/` | `domain/` (ports, models) |
| `infrastructure/` | `domain/` (to implement ports), `application/` (to wire UCs in container) |
| `presentation/` | `domain/` (types only), `infrastructure/di/` (useDI hook only) |
| `app/` (routes) | `presentation/` (screens only) |

> **App-shell exception.** The composition root under `presentation/app/`
> (`AppProvider`, `AppShell`, the `*Stack`/`*Layout` delegators) is where global
> providers get wired, so it may import DI/bootstrap artifacts from
> `infrastructure/di/` directly — e.g. `queryClient`, `DIProvider`,
> `BottomSheetModalProvider`. This is the only presentation code allowed past the
> `useDI`-only rule; feature screens/components still go through `useDI`.

### What each layer CANNOT import (violations)

| Violation | Example | Why it's wrong |
|-----------|---------|---------------|
| domain → infrastructure | `import { apiClient } from '@/infrastructure/api'` in a model | Domain must be pure |
| domain → application | `import { SomeUseCase } from '@/application'` in a port | Domain doesn't know about UCs |
| application → infrastructure | `import { apiClient } from '@/infrastructure'` in a UC | UCs depend on ports, not implementations |
| application → presentation | `import { SomeHook } from '@/presentation'` in a UC | Application doesn't know about UI |
| presentation → infrastructure (direct) | `import { apiClient } from '@/infrastructure/api'` in a hook | Must go through UC via useDI |
| app/ → anything except presentation | `import { SomeUseCase } from '@/application'` in a route | Routes only render screens |

## Use Case Pattern

Every data operation (read or write) gets its own Use Case class:

```typescript
// application/progress/GetProgressOverviewUseCase.ts
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressOverview } from "@/domain/progress/models/ProgressOverview";

export class GetProgressOverviewUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<ProgressOverview> {
    return this.port.getOverview();
  }
}
```

Rules:
- One UC per file, named `{Verb}{Noun}UseCase`
- Constructor receives port interface, NOT concrete repo
- Returns `Promise<T>` (no Result pattern — TanStack Query handles errors)
- No side effects beyond the port call
- Read UCs: `Get*`, `List*`, `Check*`
- Write UCs: `Log*`, `Create*`, `Update*`

## Port Pattern

```typescript
// domain/progress/ports/IProgressPort.ts
import type { ProgressOverview } from "../models/ProgressOverview";

export interface IProgressPort {
  getOverview(): Promise<ProgressOverview>;
  getBodyComposition(period: string): Promise<BodyComposition>;
  getExerciseStats(): Promise<ExerciseStats>;
}
```

Rules:
- Interface, never class
- Named `I{Module}Port`
- Methods return domain models, NOT API response shapes
- One port per domain module (not per endpoint)

## Repository Pattern

```typescript
// infrastructure/repositories/HttpProgressRepository.ts
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressOverview } from "@/domain/progress/models/ProgressOverview";
import { apiClient } from "../api/apiClient";

export class HttpProgressRepository implements IProgressPort {
  async getOverview(): Promise<ProgressOverview> {
    return apiClient.get("/analytics/aggregated");
  }
}
```

Rules:
- Named `Http{Module}Repository`
- `implements` the domain port interface
- Only file that knows about HTTP endpoints
- Maps API responses to domain models if shapes differ

## DI Container

```typescript
// infrastructure/di/container.ts
import { HttpProgressRepository } from "../repositories/HttpProgressRepository";
import { GetProgressOverviewUseCase } from "@/application/progress/GetProgressOverviewUseCase";

const progressRepo = new HttpProgressRepository();

export const container = {
  getProgressOverview: new GetProgressOverviewUseCase(progressRepo),
  // ...all UCs
} as const;

export type Container = typeof container;
```

## Presentation Hook Pattern

```typescript
// presentation/progress/hooks/useProgressOverview.ts
import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useProgressOverview() {
  const uc = useDI((c) => c.getProgressOverview);
  return useQuery({
    queryKey: progressKeys.overview(),
    queryFn: () => uc.execute(),
  });
}
```

Rules:
- Hooks access UCs via `useDI()` — never import repos or apiClient
- One hook per query/mutation
- Query keys from feature-local `keys.ts` factory
- Mutations use `useMutation` + `queryClient.invalidateQueries`

## Screen Pattern

```typescript
// presentation/progress/screens/OverviewScreen.tsx
export function OverviewScreen() {
  const { data, isLoading } = useProgressOverview();
  if (isLoading) return <OverviewSkeleton />;
  return <OverviewModule data={data} />;
}
```

Rules:
- Screens are thin: fetch data via hooks, render module component
- NO business logic in screens
- Loading/error states handled here (Skeleton, ErrorBoundary)

## Route File Pattern

```typescript
// app/(tabs)/progress/index.tsx
import { OverviewScreen } from "@/presentation/progress/screens/OverviewScreen";
export default function OverviewRoute() {
  return <OverviewScreen />;
}
```

Rules:
- Route files are 3-5 lines max
- Import ONLY from `presentation/`
- Default export (Expo Router requirement)
- NO hooks, NO data fetching, NO logic

### `_layout.tsx` navigators follow the same rule

Layout files are routes too: keep them thin and delegate the navigator
definition to a `presentation/` component — never author `<Stack>` / `<Tabs>` /
`<NativeTabs>` config, hooks (`useTranslation`, etc.), or design-token imports
in `app/`. Mirror the established `app/_layout.tsx` → `presentation/app/AppShell`
and `app/(tabs)/_layout.tsx` → `presentation/app/TabLayout` split.

```typescript
// app/(tabs)/_layout.tsx
import { TabLayout } from "@/presentation/app/TabLayout";
export default function TabsLayout() {
  return <TabLayout />;
}
```

The navigator (triggers, icons, tints, i18n labels) lives in
`presentation/app/TabLayout.tsx`.

## Module Inventory

| Module | Domain models | Port | Repo | UCs |
|--------|--------------|------|------|-----|
| `auth` | User, Session | IAuthPort | HttpAuthRepository | SignIn, SignUp, SignOut, GetCurrentUser |
| `progress` | ProgressOverview, BodyComposition, ExerciseStats, Trends, Records, Timeline | IProgressPort | HttpProgressRepository | Get* for each screen |
| `sessions` | Session, LiveProgress, SessionSummary | ISessionPort | HttpSessionRepository | GetSession, GetLiveProgress, ListSessions |
| `measurements` | WeightLog, PerimeterLog | IMeasurementsPort | HttpMeasurementsRepository | LogWeight, ListWeightLogs, ListPerimeterLogs |
| `activity` | StepLog, WaterLog | IActivityPort | HttpActivityRepository | LogSteps, LogWater, GetDailySteps, GetDailyWater |
| `analytics` | Streak, WeekView, ContributionGrid | IAnalyticsPort | HttpAnalyticsRepository | GetStreaks, GetWeekView, GetContributionGrid |
| `settings` | UserAccount, AthleteProfile, AuthSessionItem, ConnectedApp, PrivacyExportJob | ISettingsPort | HttpSettingsRepository | Get/Update Account, UpdatePreferences, Get/Update Profile, UpdateUsername, List/Revoke/RevokeAll Sessions, List/Revoke/UpdateScopes ConnectedApps, Request/GetLatest/GetExport, DeleteAccount |
| `health` | HealthStatus | IHealthPort | HealthKitRepository (stub) | GetHealthStatus, RequestHealthAuthorization, SetHealthMetric |

> **Note** — `settings` is a *write* module (account management), the deliberate
> exception to read-only documented in `CLAUDE.md`. `health` is an Apple Health
> scaffold: the port + stub adapter are real so DI/UI are wired now; the native
> HealthKit binding swaps in behind `IHealthPort` later.

## Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Domain model | PascalCase, noun | `ProgressOverview`, `WeightLog` |
| Port interface | `I{Module}Port` | `IProgressPort` |
| Use Case | `{Verb}{Noun}UseCase` | `GetProgressOverviewUseCase` |
| Repository | `Http{Module}Repository` | `HttpProgressRepository` |
| Hook | `use{Noun}` | `useProgressOverview` |
| Screen | `{Feature}Screen` | `OverviewScreen` |
| Query keys | `{module}Keys.{action}()` | `progressKeys.overview()` |
| Route file | kebab-case | `body-composition.tsx` |

# Architecture: Clean Architecture

## Layer Rule

```
Presentation → Application → Domain ← Infrastructure
```

**Dependencies point INWARD only.** Inner layers know nothing about outer layers.

## Dependency Rules

- **Domain** layer has NO external dependencies
- **Application** can only import from Domain
- **Infrastructure** implements interfaces defined in Domain
- **Presentation/UI** orchestrates via Application layer

## Common Violations to Avoid

```typescript
// ❌ Domain importing infrastructure
import { prisma } from '../infrastructure/db'

// ❌ UI accessing database directly
const user = await db.user.findUnique(...)

// ✅ UI calls use case, use case uses repository interface
const user = await getUserUseCase.execute(id)
```

---

## Project Layers

| Layer | Contains |
|-------|----------|
| domain | Entities, Value Objects, Repository Interfaces |
| application | Use Cases, DTOs, Application Services |
| infrastructure | Repository Implementations, External Services, Database |
| presentation | UI Components, Pages, Controllers |

Respect layer boundaries. Import only from allowed layers.

---

## State Management

**Client State**: Zustand
- Create stores in dedicated files
- Keep stores focused and small
- Use selectors to prevent unnecessary re-renders

**Server State**: React Query
- Use query keys consistently
- Invalidate queries after mutations
- Configure stale time appropriately

---

## Quality Checks

Run after every change:

```bash
npm run lint && npm run test
```

### Rules

- All code must pass type checking
- All code must pass linting
- Tests must pass before committing
- No `any` types without explicit reason