import type { UserAccount } from "../models/UserAccount";
import type {
  AthleteProfile,
  SectionVisibility,
  TimelineDetailLevel,
  ShowcaseMetric,
  FeedSharingSettings,
} from "../models/AthleteProfile";
import type {
  AuthSessionsResult,
  RevokeAllSessionsResult,
} from "../models/AuthSessionItem";
import type { ConnectedApp } from "../models/ConnectedApp";
import type { PrivacyExportJob } from "../models/PrivacyExport";
import type {
  UpdateAccountInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UpdateConnectedAppScopesInput,
  AvatarFile,
} from "../models/inputs";

/**
 * Settings module port — account & settings management (a justified write
 * surface; fitness *content* stays read-only on the platform). One port for the
 * whole module, backed by the platform `/users/*`, `/profiles/*` and
 * `/auth-sessions/*` endpoints. Methods return domain models, not API shapes.
 */
export interface ISettingsPort {
  // Account (GET/PUT /users/me, PUT /users/me/preferences)
  getAccount(): Promise<UserAccount>;
  updateAccount(input: UpdateAccountInput): Promise<UserAccount>;
  updatePreferences(input: UpdatePreferencesInput): Promise<void>;

  // Public profile (GET/PUT /profiles/me, PUT /profiles/me/username)
  getProfile(): Promise<AthleteProfile | null>;
  updateProfile(input: UpdateProfileInput): Promise<AthleteProfile>;
  updateUsername(username: string): Promise<AthleteProfile>;

  // Avatar (POST/DELETE /profiles/me/avatar) — multipart upload / clear
  uploadAvatar(file: AvatarFile): Promise<AthleteProfile>;
  removeAvatar(): Promise<AthleteProfile>;

  // Profile privacy (PUT /profiles/me/{visibility,showcase,timeline-detail,follow-approval})
  updateVisibility(visibility: SectionVisibility): Promise<void>;
  updateShowcase(metrics: ShowcaseMetric[]): Promise<void>;
  updateTimelineDetail(level: TimelineDetailLevel): Promise<void>;
  updateFollowApproval(requireApproval: boolean): Promise<void>;

  // Feed sharing (GET/PUT /profiles/me/feed-sharing) — separate read-model
  getFeedSharing(): Promise<FeedSharingSettings>;
  updateFeedSharing(settings: FeedSharingSettings): Promise<void>;

  // Devices & sessions (/auth-sessions)
  listAuthSessions(): Promise<AuthSessionsResult>;
  revokeSession(id: string): Promise<void>;
  revokeAllSessions(includeCurrent: boolean): Promise<RevokeAllSessionsResult>;

  // Connected apps (/auth-sessions/apps)
  listConnectedApps(): Promise<ConnectedApp[]>;
  revokeConnectedApp(clientId: string): Promise<void>;
  updateConnectedAppScopes(input: UpdateConnectedAppScopesInput): Promise<void>;

  // Data & privacy (/users/me/export, DELETE /users/me)
  requestDataExport(): Promise<PrivacyExportJob>;
  getLatestExport(): Promise<PrivacyExportJob | null>;
  getExportJob(id: string): Promise<PrivacyExportJob>;
  deleteAccount(): Promise<void>;
}
