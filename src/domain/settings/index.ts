// Shared fitness vocabulary, re-exported so settings consumers (screens, repo)
// stay within the settings module boundary.
export type {
  GenderType,
  MeasurementSystemType,
  FitnessGoalType,
  ExperienceLevelType,
} from "@/domain/_shared/fitness";
export type { UserAccount } from "./models/UserAccount";
export type {
  AthleteProfile,
  SectionVisibility,
  TimelineDetailLevel,
  ShowcaseMetric,
  FeedSharingSettings,
} from "./models/AthleteProfile";
export { SHOWCASE_METRICS, SHOWCASE_MAX } from "./models/AthleteProfile";
export type {
  AuthSessionItem,
  AuthSessionKind,
  AuthSessionsResult,
  RevokeAllSessionsResult,
} from "./models/AuthSessionItem";
export type {
  ConnectedApp,
  ConnectedAppCategory,
} from "./models/ConnectedApp";
export type {
  PrivacyExportJob,
  PrivacyExportStatus,
} from "./models/PrivacyExport";
export type {
  ConsentCategory,
  ThemeType,
  AccentType,
  AppLanguage,
  AIProviderType,
  SportTag,
  AvatarFile,
  UpdateAccountInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UpdateConnectedAppScopesInput,
} from "./models/inputs";
export { CONSENT_CATEGORIES } from "./models/inputs";
export type { ISettingsPort } from "./ports/ISettingsPort";
