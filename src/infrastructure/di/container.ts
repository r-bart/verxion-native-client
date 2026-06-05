import { authClient } from "../auth/authClient";
import { apiClient } from "../api/apiClient";
import { HttpAuthRepository } from "../repositories/HttpAuthRepository";
import { HttpOnboardingRepository } from "../repositories/HttpOnboardingRepository";
import { HttpAnalyticsRepository } from "../repositories/HttpAnalyticsRepository";
import { HttpSessionRepository } from "../repositories/HttpSessionRepository";
import { HttpActivityRepository } from "../repositories/HttpActivityRepository";
import { HttpMeasurementsRepository } from "../repositories/HttpMeasurementsRepository";
import { HttpProgressRepository } from "../repositories/HttpProgressRepository";
import { HttpTrainingRepository } from "../repositories/HttpTrainingRepository";
import { HttpNutritionRepository } from "../repositories/HttpNutritionRepository";
import { HttpExerciseCatalogRepository } from "../repositories/HttpExerciseCatalogRepository";
import { HttpSettingsRepository } from "../repositories/HttpSettingsRepository";
import { HealthKitRepository } from "../repositories/HealthKitRepository";
import { HttpTodayRepository } from "../repositories/HttpTodayRepository";

import { SignInUseCase } from "@/application/auth/SignInUseCase";
import { SignInWithGoogleUseCase } from "@/application/auth/SignInWithGoogleUseCase";
import { SignInWithAppleUseCase } from "@/application/auth/SignInWithAppleUseCase";
import { SignOutUseCase } from "@/application/auth/SignOutUseCase";
import { GetSessionUseCase } from "@/application/auth/GetSessionUseCase";

import { GetCurrentUserUseCase } from "@/application/onboarding/GetCurrentUserUseCase";
import { CheckUsernameUseCase } from "@/application/onboarding/CheckUsernameUseCase";
import { CompleteOnboardingUseCase } from "@/application/onboarding/CompleteOnboardingUseCase";

import { GetStreaksUseCase } from "@/application/analytics/GetStreaksUseCase";
import { GetWeekViewUseCase } from "@/application/analytics/GetWeekViewUseCase";
import { GetDayStateUseCase } from "@/application/analytics/GetDayStateUseCase";
import { GetContributionGridUseCase } from "@/application/analytics/GetContributionGridUseCase";
import { GetExecutionScoreUseCase } from "@/application/analytics/GetExecutionScoreUseCase";
import { GetSuggestedNextWorkoutUseCase } from "@/application/analytics/GetSuggestedNextWorkoutUseCase";
import { GetWeeklyTrainingReviewUseCase } from "@/application/analytics/GetWeeklyTrainingReviewUseCase";

import { GetActiveSessionUseCase } from "@/application/sessions/GetActiveSessionUseCase";
import { GetLiveProgressUseCase } from "@/application/sessions/GetLiveProgressUseCase";
import { ListSessionsUseCase } from "@/application/sessions/ListSessionsUseCase";

import { GetDailyStepsUseCase } from "@/application/activity/GetDailyStepsUseCase";
import { GetDailyWaterUseCase } from "@/application/activity/GetDailyWaterUseCase";
import { LogWaterUseCase } from "@/application/activity/LogWaterUseCase";
import { LogStepsUseCase } from "@/application/activity/LogStepsUseCase";
import { ListStepLogsUseCase } from "@/application/activity/ListStepLogsUseCase";

import { LogWeightUseCase } from "@/application/measurements/LogWeightUseCase";

import { GetProgressOverviewUseCase } from "@/application/progress/GetProgressOverviewUseCase";
import { GetBodyCompositionUseCase } from "@/application/progress/GetBodyCompositionUseCase";
import { GetExerciseStatsUseCase } from "@/application/progress/GetExerciseStatsUseCase";
import { GetExerciseDetailUseCase } from "@/application/progress/GetExerciseDetailUseCase";
import { GetRecordsUseCase } from "@/application/progress/GetRecordsUseCase";
import { GetTimelineUseCase } from "@/application/progress/GetTimelineUseCase";
import { GetWeeksUseCase } from "@/application/progress/GetWeeksUseCase";
import { GetWeekDetailUseCase } from "@/application/progress/GetWeekDetailUseCase";
import { GetMonthsUseCase } from "@/application/progress/GetMonthsUseCase";
import { GetMonthDetailUseCase } from "@/application/progress/GetMonthDetailUseCase";
import { GetSessionReportUseCase } from "@/application/progress/GetSessionReportUseCase";

import { GetRoutineDashboardUseCase } from "@/application/training/GetRoutineDashboardUseCase";
import { GetSessionFeedUseCase } from "@/application/training/GetSessionFeedUseCase";
import { GetExerciseLibraryUseCase } from "@/application/training/GetExerciseLibraryUseCase";
import { GetRoutinesUseCase } from "@/application/training/GetRoutinesUseCase";
import { GetRoutineDetailUseCase } from "@/application/training/GetRoutineDetailUseCase";
import { GetWorkoutDayExercisesUseCase } from "@/application/training/GetWorkoutDayExercisesUseCase";
import { GetExerciseConfigurationUseCase } from "@/application/training/GetExerciseConfigurationUseCase";
import { ListExercisesUseCase } from "@/application/training/ListExercisesUseCase";
import { GetExerciseCatalogDetailUseCase } from "@/application/training/GetExerciseCatalogDetailUseCase";
import { GetExerciseFiltersUseCase } from "@/application/training/GetExerciseFiltersUseCase";
import { GetProgressionPlanUseCase } from "@/application/training/GetProgressionPlanUseCase";

import { GetDietPlansUseCase } from "@/application/nutrition/GetDietPlansUseCase";
import { GetDietPlanDetailUseCase } from "@/application/nutrition/GetDietPlanDetailUseCase";
import { GetDailyMealLogsUseCase } from "@/application/nutrition/GetDailyMealLogsUseCase";
import { SearchFoodsUseCase } from "@/application/nutrition/SearchFoodsUseCase";
import { GetNutritionDayStateUseCase } from "@/application/nutrition/GetNutritionDayStateUseCase";
import { GetNutritionWeeklySummaryUseCase } from "@/application/nutrition/GetNutritionWeeklySummaryUseCase";

import { GetAccountUseCase } from "@/application/settings/GetAccountUseCase";
import { UpdateAccountUseCase } from "@/application/settings/UpdateAccountUseCase";
import { UpdatePreferencesUseCase } from "@/application/settings/UpdatePreferencesUseCase";
import { GetAthleteProfileUseCase } from "@/application/settings/GetAthleteProfileUseCase";
import { UpdateAthleteProfileUseCase } from "@/application/settings/UpdateAthleteProfileUseCase";
import { UpdateUsernameUseCase } from "@/application/settings/UpdateUsernameUseCase";
import { UploadAvatarUseCase } from "@/application/settings/UploadAvatarUseCase";
import { RemoveAvatarUseCase } from "@/application/settings/RemoveAvatarUseCase";
import { UpdateVisibilityUseCase } from "@/application/settings/UpdateVisibilityUseCase";
import { UpdateShowcaseUseCase } from "@/application/settings/UpdateShowcaseUseCase";
import { UpdateTimelineDetailUseCase } from "@/application/settings/UpdateTimelineDetailUseCase";
import { UpdateFollowApprovalUseCase } from "@/application/settings/UpdateFollowApprovalUseCase";
import { GetFeedSharingUseCase } from "@/application/settings/GetFeedSharingUseCase";
import { UpdateFeedSharingUseCase } from "@/application/settings/UpdateFeedSharingUseCase";
import { ListAuthSessionsUseCase } from "@/application/settings/ListAuthSessionsUseCase";
import { RevokeSessionUseCase } from "@/application/settings/RevokeSessionUseCase";
import { RevokeAllSessionsUseCase } from "@/application/settings/RevokeAllSessionsUseCase";
import { ListConnectedAppsUseCase } from "@/application/settings/ListConnectedAppsUseCase";
import { RevokeConnectedAppUseCase } from "@/application/settings/RevokeConnectedAppUseCase";
import { UpdateConnectedAppScopesUseCase } from "@/application/settings/UpdateConnectedAppScopesUseCase";
import { RequestDataExportUseCase } from "@/application/settings/RequestDataExportUseCase";
import { GetLatestExportUseCase } from "@/application/settings/GetLatestExportUseCase";
import { GetExportJobUseCase } from "@/application/settings/GetExportJobUseCase";
import { DeleteAccountUseCase } from "@/application/settings/DeleteAccountUseCase";

import { GetHealthStatusUseCase } from "@/application/health/GetHealthStatusUseCase";
import { RequestHealthAuthorizationUseCase } from "@/application/health/RequestHealthAuthorizationUseCase";
import { SetHealthMetricUseCase } from "@/application/health/SetHealthMetricUseCase";

import { GetTodayDashboardUseCase } from "@/application/today/GetTodayDashboardUseCase";
import { GetTimelineItemDetailUseCase } from "@/application/today/GetTimelineItemDetailUseCase";

import { track, identify } from "../analytics/analytics";
import { initPostHog } from "../analytics/posthogClient";
import * as onboardingDraftStore from "../storage/onboardingDraft";
import * as languagePreference from "../storage/languagePreference";
import { appVersion } from "../config/appConfig";

// Wire auth cookie to API client at infrastructure initialization
apiClient.setGetCookie(() => authClient.getCookie());
// Initialize telemetry here (DI wiring), so presentation never imports the
// analytics module directly — it reaches `track`/`identify` via `useDI`.
initPostHog();

const authRepo = new HttpAuthRepository();
const onboardingRepo = new HttpOnboardingRepository();
const analyticsRepo = new HttpAnalyticsRepository();
const sessionRepo = new HttpSessionRepository();
const activityRepo = new HttpActivityRepository();
const measurementsRepo = new HttpMeasurementsRepository();
const progressRepo = new HttpProgressRepository();
const trainingRepo = new HttpTrainingRepository();
const nutritionRepo = new HttpNutritionRepository();
const exerciseCatalogRepo = new HttpExerciseCatalogRepository();
const settingsRepo = new HttpSettingsRepository();
const healthRepo = new HealthKitRepository();
const todayRepo = new HttpTodayRepository();

export const container = {
  // Auth
  signIn: new SignInUseCase(authRepo),
  signInGoogle: new SignInWithGoogleUseCase(authRepo),
  signInApple: new SignInWithAppleUseCase(authRepo),
  signOut: new SignOutUseCase(authRepo),
  getSession: new GetSessionUseCase(authRepo),

  // Onboarding (current-user gate + username check + onboard write)
  getCurrentUser: new GetCurrentUserUseCase(onboardingRepo),
  checkUsername: new CheckUsernameUseCase(onboardingRepo),
  completeOnboarding: new CompleteOnboardingUseCase(onboardingRepo),

  // Cross-cutting services — exposed via DI so presentation reaches them
  // through `useDI`, never importing infrastructure directly.
  // `telemetry`: fire-and-forget analytics (PostHog behind an adapter).
  // `onboardingDraftStore`: durable onboarding UI state (SecureStore).
  // `languagePreference`: persisted app-language override (SecureStore).
  // `appInfo`: static build metadata (version) from expo-constants.
  telemetry: { track, identify },
  onboardingDraftStore,
  languagePreference,
  appInfo: { version: appVersion },

  // Analytics
  getStreaks: new GetStreaksUseCase(analyticsRepo),
  getWeekView: new GetWeekViewUseCase(analyticsRepo),
  getDayState: new GetDayStateUseCase(analyticsRepo),
  getContributionGrid: new GetContributionGridUseCase(analyticsRepo),
  getExecutionScore: new GetExecutionScoreUseCase(analyticsRepo),
  getSuggestedNextWorkout: new GetSuggestedNextWorkoutUseCase(analyticsRepo),
  getWeeklyTrainingReview: new GetWeeklyTrainingReviewUseCase(analyticsRepo),

  // Sessions
  getActiveSession: new GetActiveSessionUseCase(sessionRepo),
  getLiveProgress: new GetLiveProgressUseCase(sessionRepo),
  listSessions: new ListSessionsUseCase(sessionRepo),

  // Activity
  getDailySteps: new GetDailyStepsUseCase(activityRepo),
  getDailyWater: new GetDailyWaterUseCase(activityRepo),
  logWater: new LogWaterUseCase(activityRepo),
  logSteps: new LogStepsUseCase(activityRepo),
  listStepLogs: new ListStepLogsUseCase(activityRepo),

  // Measurements
  logWeight: new LogWeightUseCase(measurementsRepo),

  // Progress
  getProgressOverview: new GetProgressOverviewUseCase(progressRepo),
  getBodyComposition: new GetBodyCompositionUseCase(progressRepo),
  getExerciseStats: new GetExerciseStatsUseCase(progressRepo),
  getExerciseDetail: new GetExerciseDetailUseCase(progressRepo),
  getRecords: new GetRecordsUseCase(progressRepo),
  getTimeline: new GetTimelineUseCase(progressRepo),
  getWeeks: new GetWeeksUseCase(progressRepo),
  getWeekDetail: new GetWeekDetailUseCase(progressRepo),
  getMonths: new GetMonthsUseCase(progressRepo),
  getMonthDetail: new GetMonthDetailUseCase(progressRepo),
  getSessionReport: new GetSessionReportUseCase(progressRepo),

  // Training (routines & workout days)
  getRoutineDashboard: new GetRoutineDashboardUseCase(trainingRepo),
  getSessionFeed: new GetSessionFeedUseCase(trainingRepo),
  getExerciseLibrary: new GetExerciseLibraryUseCase(trainingRepo),
  getRoutines: new GetRoutinesUseCase(trainingRepo),
  getRoutineDetail: new GetRoutineDetailUseCase(trainingRepo),
  getWorkoutDayExercises: new GetWorkoutDayExercisesUseCase(trainingRepo),
  getExerciseConfiguration: new GetExerciseConfigurationUseCase(trainingRepo),

  getProgressionPlan: new GetProgressionPlanUseCase(trainingRepo),

  // Exercise Catalog (browse & detail)
  listExercises: new ListExercisesUseCase(exerciseCatalogRepo),
  getExerciseCatalogDetail: new GetExerciseCatalogDetailUseCase(exerciseCatalogRepo),
  getExerciseFilters: new GetExerciseFiltersUseCase(exerciseCatalogRepo),

  // Nutrition
  getDietPlans: new GetDietPlansUseCase(nutritionRepo),
  getDietPlanDetail: new GetDietPlanDetailUseCase(nutritionRepo),
  getDailyMealLogs: new GetDailyMealLogsUseCase(nutritionRepo),
  searchFoods: new SearchFoodsUseCase(nutritionRepo),
  getNutritionDayState: new GetNutritionDayStateUseCase(nutritionRepo),
  getNutritionWeeklySummary: new GetNutritionWeeklySummaryUseCase(nutritionRepo),

  // Settings (account & settings management — a justified write surface;
  // fitness content stays read-only). Backed by /users, /profiles, /auth-sessions.
  getAccount: new GetAccountUseCase(settingsRepo),
  updateAccount: new UpdateAccountUseCase(settingsRepo),
  updatePreferences: new UpdatePreferencesUseCase(settingsRepo),
  getAthleteProfile: new GetAthleteProfileUseCase(settingsRepo),
  updateAthleteProfile: new UpdateAthleteProfileUseCase(settingsRepo),
  updateUsername: new UpdateUsernameUseCase(settingsRepo),
  uploadAvatar: new UploadAvatarUseCase(settingsRepo),
  removeAvatar: new RemoveAvatarUseCase(settingsRepo),
  updateVisibility: new UpdateVisibilityUseCase(settingsRepo),
  updateShowcase: new UpdateShowcaseUseCase(settingsRepo),
  updateTimelineDetail: new UpdateTimelineDetailUseCase(settingsRepo),
  updateFollowApproval: new UpdateFollowApprovalUseCase(settingsRepo),
  getFeedSharing: new GetFeedSharingUseCase(settingsRepo),
  updateFeedSharing: new UpdateFeedSharingUseCase(settingsRepo),
  listAuthSessions: new ListAuthSessionsUseCase(settingsRepo),
  revokeSession: new RevokeSessionUseCase(settingsRepo),
  revokeAllSessions: new RevokeAllSessionsUseCase(settingsRepo),
  listConnectedApps: new ListConnectedAppsUseCase(settingsRepo),
  revokeConnectedApp: new RevokeConnectedAppUseCase(settingsRepo),
  updateConnectedAppScopes: new UpdateConnectedAppScopesUseCase(settingsRepo),
  requestDataExport: new RequestDataExportUseCase(settingsRepo),
  getLatestExport: new GetLatestExportUseCase(settingsRepo),
  getExportJob: new GetExportJobUseCase(settingsRepo),
  deleteAccount: new DeleteAccountUseCase(settingsRepo),

  // Health (Apple Health integration — stub adapter until the native binding).
  getHealthStatus: new GetHealthStatusUseCase(healthRepo),
  requestHealthAuthorization: new RequestHealthAuthorizationUseCase(healthRepo),
  setHealthMetric: new SetHealthMetricUseCase(healthRepo),

  // Today ("Hoy" aggregate — GET /today eager + lazy timeline detail)
  getTodayDashboard: new GetTodayDashboardUseCase(todayRepo),
  getTimelineItemDetail: new GetTimelineItemDetailUseCase(todayRepo),
} as const;

export type Container = typeof container;
