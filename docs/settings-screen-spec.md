# "Ajustes" (Settings) — rationale, edge cases & API spec

> **Shape note — this is NOT a single aggregate.** Unlike "Hoy" (one screen → one
> read-model), `settings` is a **multi-endpoint write module**: account & settings
> management, the deliberate read-only exception documented in `CLAUDE.md`. So this
> doc adapts the screen-spec template to **enumerate every endpoint** the settings
> surface consumes, grouped by sub-screen, rather than describing one aggregate.
>
> Architecture contract (fixed — see `CLAUDE.md` + `docs/ARCHITECTURE.md`):
> - HTTP lives ONLY in `infrastructure/repositories/HttpSettingsRepository.ts`
>   (implements `ISettingsPort`); every screen reaches it via a UC through `useDI`.
> - The native app stays a thin viewer/editor: it sends only changed fields and
>   paints server-returned models. **All consent/cooldown/lifecycle derivation is
>   server-side** (e.g. the connected-app `categories` view, the username cooldown).
> - Response/Input types → Zod in `@verxion/shared` → OpenAPI → native codegen.
>
> Status: **verified against staging.** Native module is **already built and wired
> to `HttpSettingsRepository`** (not a fixture). **All 16 endpoints below exist in
> `staging.openapi.json`** (probed 2026-06-05). This doc is therefore a *confirmation
> + contract reference*, not a build request — the open items are envelope/scoping
> details (§7–§8), not missing routes.
> Design ref: `screenshots/...` (settings sub-screens). Design thesis:
> *"tu cuenta se gestiona aquí; tu contenido (workouts/dietas) vive en la plataforma."*

---

## 1. Endpoint(s)

Sixteen endpoints across five groups. **Exists?** = present in `staging.openapi.json`.

| # | Method · Path | Domain UC | Returns | Exists? |
|---|---|---|---|---|
| **Account** ||||
| 1 | `GET /users/me` | `GetAccountUseCase` | `UserAccount` | ✓ |
| 2 | `PUT /users/me` | `UpdateAccountUseCase` | `{ user: UserAccount }` | ✓ |
| 3 | `PUT /users/me/preferences` | `UpdatePreferencesUseCase` | `204` | ✓ |
| **Public profile** ||||
| 4 | `GET /profiles/me` | `GetAthleteProfileUseCase` | `AthleteProfile` \| `404` (no profile yet) | ✓ |
| 5 | `PUT /profiles/me` | `UpdateAthleteProfileUseCase` | `AthleteProfile` | ✓ |
| 6 | `PUT /profiles/me/username` | `UpdateUsernameUseCase` | `AthleteProfile` | ✓ |
| **Devices & sessions** ||||
| 7 | `GET /auth-sessions` | `ListAuthSessionsUseCase` | `{ items: AuthSessionItem[], total }` | ✓ |
| 8 | `DELETE /auth-sessions/{id}` | `RevokeSessionUseCase` | `204` | ✓ |
| 9 | `POST /auth-sessions/revoke-all` | `RevokeAllSessionsUseCase` | `RevokeAllSessionsResult` | ✓ |
| **Connected apps** (OAuth/MCP) ||||
| 10 | `GET /auth-sessions/apps` | `ListConnectedAppsUseCase` | `ConnectedApp[]` | ✓ |
| 11 | `DELETE /auth-sessions/apps/{clientId}` | `RevokeConnectedAppUseCase` | `204` | ✓ |
| 12 | `PATCH /auth-sessions/apps/{clientId}/scopes` | `UpdateConnectedAppScopesUseCase` | `204` | ✓ |
| **Data & privacy** ||||
| 13 | `POST /users/me/export` | `RequestDataExportUseCase` | `PrivacyExportJob` | ✓ |
| 14 | `GET /users/me/export/latest` | `GetLatestExportUseCase` | `PrivacyExportJob` \| `null` | ✓ |
| 15 | `GET /users/me/export/{id}` | `GetExportJobUseCase` | `PrivacyExportJob` | ✓ |
| 16 | `DELETE /users/me` | `DeleteAccountUseCase` | `204` | ✓ |

**Sub-screen → endpoints** (route files in `app/settings/`):

| Sub-screen | Reads | Writes |
|---|---|---|
| `index` (hub) | — | app language (device-local, see §3) |
| `account` | 1, 4 | 5 (displayName/bio/sportTags), 6 (username) |
| `personal` | 1 | 2 (sex/dob/height/system/level) + 3 (primaryGoal) |
| `notifications` | — | — (local scaffold only; **no endpoint yet**, see §8.4) |
| `connected-apps` | 10 | 11, 12 |
| `sessions` | 7 | 8, 9 |
| `data` | 14 (+ 15 poll) | 13, 16 |
| `health` | — | — (Apple Health / device-side; **not an API concern**, see §8.5) |
| `about` | — | — (static) |

> **Empty-state reuse (answers the "ad-hoc endpoint?" question):** the "Hoy" empty
> state's *"is an agent connected?"* check reuses **#10 `GET /auth-sessions/apps`**
> — the exact SPA signal — via `useConnectedAgent`. **No ad-hoc endpoint needed.**
> See the dedicated note after §6.

---

## 2. Response / Input shapes (authoritative TS)

> Source of truth for the Zod schemas. Mirrors `src/domain/settings/models/*`.
> The repository already maps raw API → these models; field renames are noted in §3.

```ts
// ── Account (GET/PUT /users/me) ──────────────────────────────────────────────
interface UserAccount {
  id: string;
  email: string;                 // read-only — managed by the auth provider
  name: string | null;
  username: string | null;
  gender: GenderType | null;     // API field is `sex` (see §3)
  dateOfBirth: string | null;    // ISO yyyy-mm-dd
  heightCm: number | null;
  measurementSystem: "metric" | "imperial";
  experienceLevel: ExperienceLevelType;
  primaryGoal: FitnessGoalType | null;   // API nests as fitnessGoals.primary
  language: "en" | "es" | null;          // ← NEEDED on read: appPreferences.language,
                                         //   symmetric with PUT …/preferences (see §8.3).
                                         //   null/absent = never set → client uses device locale.
  currentHealthConsentVersion: string;   // gates writes to PUT /users/me
}
interface UpdateAccountInput {           // PUT /users/me — only changed fields sent
  sex?: GenderType | null;
  dateOfBirth?: string | null;
  heightCm?: number;
  measurementSystem?: "metric" | "imperial";
  experienceLevel?: ExperienceLevelType;
}
interface UpdatePreferencesInput {       // PUT /users/me/preferences — nested groups (full contract)
  fitnessPreferences?: { measurementSystem?: "metric" | "imperial"; experienceLevel?: ExperienceLevelType; primaryGoal?: FitnessGoalType };
  appPreferences?: { theme?: "light" | "dark" | "system"; accent?: AccentType; language?: "en" | "es" };
  aiPreferences?: { provider: "openai" | "anthropic" | "google"; modelId: string };   // BYOK (Agent section)
}

// ── Public profile (GET/PUT /profiles/me, PUT …/username) ────────────────────
interface AthleteProfile {
  username: string;
  displayName: string;
  bio: string | null;            // null = never set (distinct from "")
  avatarUrl: string | null;
  sportTags: string[];
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
  usernameChangedAt: string | null;   // ISO — drives the 30-day cooldown UI (§5)
}
interface UpdateProfileInput { displayName?: string; bio?: string; sportTags?: SportTag[]; }  // sportTags is a closed enum on write

// ── Devices & sessions (/auth-sessions) ──────────────────────────────────────
type AuthSessionKind = "oauth_access_token" | "session";
interface AuthSessionItem {
  id: string;
  kind: AuthSessionKind;
  clientId: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  lastActiveAt: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  display: string;               // server-formatted device/app label (§3)
}
interface AuthSessionsResult { items: AuthSessionItem[]; total: number; }
interface RevokeAllSessionsResult { revokedCount: number; keptCurrent: boolean; }

// ── Connected apps (/auth-sessions/apps) ─────────────────────────────────────
type ConsentCategory = "workouts" | "nutrition" | "profile" | "social" | "notes";
interface ConnectedAppCategory { key: ConsentCategory; active: boolean; destructive: boolean; }
interface ConnectedApp {
  clientId: string;
  appName: string;               // e.g. "Claude", "ChatGPT" — the agent's name
  scopes: string[];
  categories: ConnectedAppCategory[];   // server-computed per-category consent view (§5)
  authorizedAt: string | null;
  tokenCount: number;
}
interface UpdateConnectedAppScopesInput {   // PATCH …/{clientId}/scopes
  clientId: string;
  categories: ConsentCategory[];
  includeDestructive: boolean;
}

// ── Data & privacy (/users/me/export, DELETE /users/me) ──────────────────────
type PrivacyExportStatus =
  "requested" | "processing" | "ready" | "downloaded" | "expired" | "failed";
interface PrivacyExportJob {
  id: string;
  status: PrivacyExportStatus;   // "no job" = null on the client, NOT a status
  requestedAt: string | null;
  expiresAt: string | null;
}
```

---

## 3. Client vs. server — formatting split & field renames

The client sends only changed fields and paints server-returned models verbatim.
Renames the repository performs (API ↔ domain):

| Domain field | API field | Mode | Notes |
|---|---|---|---|
| `UserAccount.gender` / `UpdateAccountInput.sex` | `sex` | raw enum | API names it `sex` |
| `UserAccount.primaryGoal` | `fitnessGoals.primary` | raw enum | nested on read |
| `AuthSessionItem.display` | `display` | **display-ready** | server device/app label, painted verbatim |
| `ConnectedApp.categories[]` | computed | **raw (computed)** | server derives per-category consent from scopes — client never re-derives |
| `AthleteProfile.usernameChangedAt` | iso | **timestamp** | client computes the 30-day cooldown remaining locally for the UI, but the **server enforces** (§5) |
| `*.createdAt/expiresAt/lastActiveAt/authorizedAt/requestedAt` | iso | **timestamp** | full ISO-8601; client renders relative/local |
| numbers (`followerCount`, `tokenCount`, `revokedCount`, `heightCm`) | raw | **raw** | client locale-groups |

**App language is device-local.** The hub's language toggle persists to local
storage (`languagePreference`), NOT the server, even though
`PUT /users/me/preferences { appPreferences.language }` exists. Decision §8.3.

**Fixed on the client (not in any response):** all icons, section grouping, the
consent-category labels (i18n'd client-side from the `ConsentCategory` enum),
destructive-scope warnings, confirm dialogs, settings chrome.

---

## 4. Field → platform source mapping

> Every settings UC already has a backing route (all ✓ in §1). No **NEW** domain
> services are required for the settings module — contrast "Hoy", which needed two.

| Capability | Route (§1) | Exists? | Notes |
|---|---|---|---|
| Read account | 1 | ✓ | maps `RawUserProfile` → `UserAccount` |
| Save personal/fitness | 2 + 3 | ✓ | `personal` screen writes BOTH in one save |
| Read/edit public profile | 4, 5 | ✓ | `404` ⇒ no profile yet → `null` (repo catches it) |
| Change username | 6 | ✓ | 30-day cooldown (§5) |
| List/revoke sessions | 7, 8, 9 | ✓ | `revoke-all` takes `includeCurrent` |
| List/revoke/scope connected apps | 10, 11, 12 | ✓ | also the agent-connection signal |
| Request/poll export | 13, 14, 15 | ✓ | async job lifecycle (§5) |
| Delete account | 16 | ✓ | irreversible (§6) |

---

## 5. Server-computed business rules

| Rule | Definition | Constant | Lives in |
|---|---|---|---|
| **Username cooldown** | `usernameChangedAt + 30d > now` ⇒ change rejected | 30 days | profile service (server-enforced; client mirrors for UX only) |
| **Consent categories** | each `ConnectedAppCategory.{active,destructive}` derived from raw OAuth scopes | `CONSENT_CATEGORIES` (5) | auth-scopes service |
| **`includeDestructive`** | whether granting a category also grants its `*.write`/destructive scope | — | scopes mapper |
| **Export lifecycle** | `requested → processing → ready → downloaded`; `expired`/`failed` terminal | TTL on `expiresAt` | export job worker |
| **`revoke-all`** | revokes all sessions/tokens; `keptCurrent` true iff `includeCurrent=false` | — | sessions service |
| **`isCurrent`** | the session backing this request | — | sessions service |
| **Health-consent gate** | `PUT /users/me` requires the active `currentHealthConsentVersion` | — | users service |

---

## 6. Edge cases

| # | Case | Server behavior | Client handling (built) |
|---|---|---|---|
| 1 | **No profile yet** (fresh social sign-in pre-onboarding) | `GET /profiles/me` → `404` | repo catches `404` → `null` → profile card prompts to complete |
| 2 | **Username within cooldown** | reject (4xx) with reason | disable field + show remaining days from `usernameChangedAt` |
| 3 | **Username taken** | reject (409) | inline error |
| 4 | **No connected apps** | `GET /auth-sessions/apps` → `[]` | empty state; "Hoy" steps card stays "connect" |
| 5 | **Revoke current session** | allowed; client session ends | confirm dialog → sign-out flow |
| 6 | **`revoke-all` keep current** | `includeCurrent:false`; `keptCurrent:true` | toast `revokedCount` |
| 7 | **Export already in flight** | `latest` returns the active job | poll #15 until terminal; disable re-request |
| 8 | **Export expired/failed** | terminal status | show status; allow re-request |
| 9 | **Delete account** | irreversible cascade | double-confirm; sign out + clear secure store |
| 10 | **Stale health-consent version** | `PUT /users/me` rejected | surface re-consent (currently rare — flag) |
| 11 | **Loading/failure per screen** | n/a | section skeletons + `settings.*.error` |

---

### Empty-state agent-connection — do we need an ad-hoc endpoint? **No.**

The "Hoy" empty state asks *"has the user connected an AI agent yet?"* — the same
question the web SPA answers from its connected-apps list. The native app reuses
**#10 `GET /auth-sessions/apps`** directly:

- `useConnectedAgent` (in `presentation/today/hooks/`) wraps the settings
  `useConnectedApps` query (shared cache key `settingsKeys.connectedApps()`).
- **connected** ⇔ the list is non-empty; the surfaced name is the first
  `ConnectedApp.appName`. The empty-state steps card flips step 1 to "done · {name}".
- v1 treats *any* authorized app as "the agent". If we later need to distinguish a
  true MCP agent from another OAuth client, filter by a known **client-id allowlist**
  — still no new endpoint, just a client predicate (or, if the server wants to own
  it, an `isAgent: boolean` on `ConnectedApp`; see §8.2).

So the only thing the empty state needs from the platform already exists. The one
*optional* server nicety would be marking which connected app is an agent (§8.2).

---

## 7. Platform prerequisites — BLOCKERS

- [x] **All 16 routes exist** in `staging.openapi.json` (probed 2026-06-05). No new
      domain services required for settings.
- [x] **OpenAPI response envelope `$ref`s the schema.** ✅ Resolved on `develop`
      (verified 2026-06-05): route responses now `$ref` the named component inside
      `data` (e.g. `GET /users/me` → `data: UserProfileResponse`). Codegen is
      response-usable; native still maps by hand but the contract is now typed.
- [x] **`GET /users/me` exposes `appPreferences.language`.** ✅ Resolved on `develop`:
      `UserProfileResponse.preferences = { theme, accent, language }`. Native now reads
      it into `UserAccount.language` (`null` = unset → device locale). Unblocks the
      §8.3 post-login language reconcile (wiring still pending).
- [ ] **OAuth scopes for the settings routes** — confirm a `.read` tier exists for
      reads (account, profile, sessions, apps, export) and the appropriate write tier
      for mutations; ensure both `auth/scopes.ts` and `mcp-server/utils/scopes.ts` agree.
- [ ] **Health-consent version surfacing** — if `PUT /users/me` can reject on a stale
      `currentHealthConsentVersion`, the API should return a typed reason the client
      can route to a re-consent screen (edge 10). Confirm whether this is live.

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

1. **`name` has no update path here** — `UserAccount.name` is read on `GET /users/me`
   but `UpdateAccountInput` omits it; display name is edited via `PUT /profiles/me`
   (`displayName`). **recommend:** keep `name` read-only in settings (profile owns the
   public name); confirm that's intended. *(open)*
2. **Mark the agent among connected apps** — optional `ConnectedApp.isAgent: boolean`
   (or an `appType`) so the empty state needn't guess via client allowlist.
   **recommend:** add it server-side eventually; not a blocker. *(open)*
3. **App language control** — **resolved direction: local-first reactive + server
   mirror.** Precedence: **explicit user choice (local) > server preference > device
   locale**. Rationale: the UI must switch instantly/offline (→ local-persisted
   react-i18next stays the reactive source), BUT the server generates localized prose
   (agent notes, emails, push) so it must know the language (→ mirror writes), and a
   returning user on a new device should recover their choice (→ read on login). Wiring:
   - **Write (toggle):** apply locally + fire-and-forget `PUT /users/me/preferences
     { appPreferences: { language } }`.
   - **Read (post-login reconcile):** if no local explicit choice, adopt
     `GET /users/me` → `appPreferences.language`; local choice otherwise wins.
   - **Depends on §7:** `GET /users/me` exposing `appPreferences.language` *(in
     progress platform-side)*. Cross-device last-write-wins (by timestamp) is a future
     refinement; v1 propagates only when there's no local override. *(direction
     resolved; native wiring lands when the read field exists)*
4. **Notifications** — `notifications` screen is a local scaffold (permission +
   reminder toggles, no backend). Needs a push/notification-prefs endpoint when real.
   **recommend:** out of scope until push is built. *(deferred)*
5. **Health** — `health` screen is Apple Health / device-side behind `IHealthPort`
   (stub adapter). **Not an API concern**; excluded from this spec. *(resolved)*
6. **Export download** — once `status:"ready"`, how is the file delivered (signed URL
   on the job? a separate download route)? The model has no `downloadUrl`.
   **recommend:** add `downloadUrl` to `PrivacyExportJob` when `ready`. *(open)*

---

## 9. Contract registration checklist (per endpoint, when hardening)

- [ ] Response/Input Zod schemas in `@verxion/shared/src/schemas/settings.ts` (+ inferred types, + index export)
- [ ] Each route `$ref`s its component schema in the `data` envelope (→ §7 gap) → OpenAPI route-inventory parity test green
- [ ] Contract test validates each live response against the shared schema
- [ ] OAuth scope tiers asserted for every route (read vs write)
- [ ] Native: regenerate `api-types.ts` from `/openapi.json`; the existing
      `HttpSettingsRepository` already matches — diff-verify after regen

---

## Swap-in status (native)

**Already done.** `HttpSettingsRepository implements ISettingsPort` is wired in
`infrastructure/di/container.ts` (not a fixture); all screens, hooks, and
`settingsKeys` are source-agnostic. This module ships against staging today; the
remaining work is platform-side hardening (§7) and the open product decisions (§8).
