import type {
  GenderType,
  MeasurementSystemType,
  ExperienceLevelType,
  FitnessGoalType,
  AppLanguage,
  ISettingsPort,
  UserAccount,
  AthleteProfile,
  SectionVisibility,
  TimelineDetailLevel,
  ShowcaseMetric,
  FeedSharingSettings,
  AuthSessionsResult,
  AuthSessionItem,
  RevokeAllSessionsResult,
  ConnectedApp,
  PrivacyExportJob,
  UpdateAccountInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UpdateConnectedAppScopesInput,
  AvatarFile,
} from "@/domain/settings";
import { apiClient, ApiError } from "../api/apiClient";

// ── Raw API response shapes (only the fields we read) ────────────────────────

interface RawUserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  measurementSystem?: MeasurementSystemType;
  experienceLevel?: ExperienceLevelType;
  fitnessGoals?: { primary?: FitnessGoalType | null } | null;
  preferences?: { theme?: string; accent?: string; language?: string | null } | null;
  currentHealthConsentVersion: string;
}

interface RawAthleteProfile {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl?: string | null;
  sportTags: string[];
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
  usernameChangedAt?: string | null;
  sectionVisibility?: SectionVisibility | null;
  showcaseMetrics?: ShowcaseMetric[] | null;
  timelineDetailLevel?: TimelineDetailLevel | null;
  requireFollowApproval?: boolean | null;
}

type RawAuthSessionItem = AuthSessionItem;
type RawConnectedApp = ConnectedApp;
type RawExportJob = PrivacyExportJob;

function toUserAccount(r: RawUserProfile): UserAccount {
  return {
    id: r.id,
    email: r.email ?? "",
    name: r.name ?? null,
    username: r.username ?? null,
    gender: r.gender ?? null,
    dateOfBirth: r.dateOfBirth ?? null,
    heightCm: r.heightCm ?? null,
    measurementSystem: r.measurementSystem ?? "metric",
    experienceLevel: r.experienceLevel ?? "beginner",
    primaryGoal: r.fitnessGoals?.primary ?? null,
    // API types `preferences.language` as a free string; narrow to the closed
    // app-language union (anything else → null → device-locale fallback).
    language: (r.preferences?.language ?? null) as AppLanguage | null,
    currentHealthConsentVersion: r.currentHealthConsentVersion,
  };
}

function toAthleteProfile(r: RawAthleteProfile): AthleteProfile {
  return {
    username: r.username,
    displayName: r.displayName,
    bio: r.bio,
    avatarUrl: r.avatarUrl ?? null,
    sportTags: r.sportTags ?? [],
    isPublic: r.isPublic,
    followerCount: r.followerCount,
    followingCount: r.followingCount,
    usernameChangedAt: r.usernameChangedAt ?? null,
    sectionVisibility: r.sectionVisibility ?? {
      bio: true,
      training: true,
      bodyMetrics: true,
      nutrition: true,
    },
    showcaseMetrics: r.showcaseMetrics ?? [],
    timelineDetailLevel: r.timelineDetailLevel ?? "summary",
    requireFollowApproval: r.requireFollowApproval ?? false,
  };
}

/**
 * Settings repository — the only place that knows the `/users/*`, `/profiles/*`
 * and `/auth-sessions/*` HTTP endpoints. Maps raw responses to domain models.
 */
export class HttpSettingsRepository implements ISettingsPort {
  // ── Account ────────────────────────────────────────────────────────────────
  async getAccount(): Promise<UserAccount> {
    const r = await apiClient.get<RawUserProfile>("/users/me");
    return toUserAccount(r);
  }

  async updateAccount(input: UpdateAccountInput): Promise<UserAccount> {
    const res = await apiClient.put<{ user: RawUserProfile }>("/users/me", input);
    return toUserAccount(res.user);
  }

  async updatePreferences(input: UpdatePreferencesInput): Promise<void> {
    await apiClient.put("/users/me/preferences", input);
  }

  // ── Public profile ───────────────────────────────────────────────────────
  async getProfile(): Promise<AthleteProfile | null> {
    // No profile yet (fresh sign-in pre-onboarding) → the API answers `404`,
    // not `204`. Treat that one status as the empty case; rethrow anything else.
    try {
      const r = await apiClient.get<RawAthleteProfile>("/profiles/me");
      return toAthleteProfile(r);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }

  async updateProfile(input: UpdateProfileInput): Promise<AthleteProfile> {
    const r = await apiClient.put<RawAthleteProfile>("/profiles/me", input);
    return toAthleteProfile(r);
  }

  async updateUsername(username: string): Promise<AthleteProfile> {
    const r = await apiClient.put<RawAthleteProfile>("/profiles/me/username", {
      username,
    });
    return toAthleteProfile(r);
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  // Both endpoints answer `{ avatarUrl, profile }` (the spec types it as a bare
  // object); we map the returned `profile` back to the domain model.
  async uploadAvatar(file: AvatarFile): Promise<AthleteProfile> {
    const form = new FormData();
    // React Native FormData file part — uri/name/type, not a Blob.
    form.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    const res = await apiClient.postForm<{ profile: RawAthleteProfile }>(
      "/profiles/me/avatar",
      form,
    );
    return toAthleteProfile(res.profile);
  }

  async removeAvatar(): Promise<AthleteProfile> {
    const res = await apiClient.del<{ profile: RawAthleteProfile }>("/profiles/me/avatar");
    return toAthleteProfile(res.profile);
  }

  // ── Profile privacy ──────────────────────────────────────────────────────
  // These PUTs return an opaque body in the contract; we ignore it and let the
  // caller refetch `/profiles/me` (the source of the current privacy state).
  async updateVisibility(visibility: SectionVisibility): Promise<void> {
    await apiClient.put("/profiles/me/visibility", visibility);
  }

  async updateShowcase(metrics: ShowcaseMetric[]): Promise<void> {
    await apiClient.put("/profiles/me/showcase", { metrics });
  }

  async updateTimelineDetail(level: TimelineDetailLevel): Promise<void> {
    await apiClient.put("/profiles/me/timeline-detail", { timelineDetailLevel: level });
  }

  async updateFollowApproval(requireApproval: boolean): Promise<void> {
    await apiClient.put("/profiles/me/follow-approval", { requireApproval });
  }

  // ── Feed sharing ─────────────────────────────────────────────────────────
  async getFeedSharing(): Promise<FeedSharingSettings> {
    return apiClient.get<FeedSharingSettings>("/profiles/me/feed-sharing");
  }

  async updateFeedSharing(settings: FeedSharingSettings): Promise<void> {
    await apiClient.put("/profiles/me/feed-sharing", { feedSharingSettings: settings });
  }

  // ── Devices & sessions ─────────────────────────────────────────────────────
  async listAuthSessions(): Promise<AuthSessionsResult> {
    const r = await apiClient.get<{ items: RawAuthSessionItem[]; total: number }>(
      "/auth-sessions",
    );
    return { items: r.items, total: r.total };
  }

  async revokeSession(id: string): Promise<void> {
    await apiClient.del(`/auth-sessions/${encodeURIComponent(id)}`);
  }

  async revokeAllSessions(includeCurrent: boolean): Promise<RevokeAllSessionsResult> {
    // NOTE: the OpenAPI types this body as an empty `{}` (the `includeCurrent`
    // property isn't described in the contract), but the route honors it at
    // runtime — `keptCurrent` reflects it. Kept as-is per the API-is-truth rule.
    return apiClient.post<RevokeAllSessionsResult>("/auth-sessions/revoke-all", {
      includeCurrent,
    });
  }

  // ── Connected apps ───────────────────────────────────────────────────────
  async listConnectedApps(): Promise<ConnectedApp[]> {
    return apiClient.get<RawConnectedApp[]>("/auth-sessions/apps");
  }

  async revokeConnectedApp(clientId: string): Promise<void> {
    await apiClient.del(`/auth-sessions/apps/${encodeURIComponent(clientId)}`);
  }

  async updateConnectedAppScopes(
    input: UpdateConnectedAppScopesInput,
  ): Promise<void> {
    // NOTE: the OpenAPI omits this route's requestBody, but the endpoint
    // consumes `{ categories, includeDestructive }` at runtime. Sent as-is per
    // the API-is-truth rule (no backend change requested; spec gap only).
    await apiClient.patch(
      `/auth-sessions/apps/${encodeURIComponent(input.clientId)}/scopes`,
      {
        categories: input.categories,
        includeDestructive: input.includeDestructive,
      },
    );
  }

  // ── Data & privacy ─────────────────────────────────────────────────────────
  async requestDataExport(): Promise<PrivacyExportJob> {
    return apiClient.post<RawExportJob>("/users/me/export");
  }

  async getLatestExport(): Promise<PrivacyExportJob | null> {
    const r = await apiClient.get<RawExportJob | null>("/users/me/export/latest");
    return r ?? null;
  }

  async getExportJob(id: string): Promise<PrivacyExportJob> {
    return apiClient.get<RawExportJob>(`/users/me/export/${encodeURIComponent(id)}`);
  }

  async deleteAccount(): Promise<void> {
    await apiClient.del("/users/me");
  }
}
