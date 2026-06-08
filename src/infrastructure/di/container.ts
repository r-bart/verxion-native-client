import { authClient } from "../auth/authClient";
import { apiClient } from "../api/apiClient";
import { queryClient } from "./queryClient";
import { bootstrapInfrastructure } from "./bootstrap";
import { HttpAuthRepository } from "../repositories/HttpAuthRepository";
import { HttpOnboardingRepository } from "../repositories/HttpOnboardingRepository";
import { HttpAnalyticsRepository } from "../repositories/HttpAnalyticsRepository";
import { HttpSessionRepository } from "../repositories/HttpSessionRepository";
import { HttpActivityRepository } from "../repositories/HttpActivityRepository";
import { HttpMeasurementsRepository } from "../repositories/HttpMeasurementsRepository";
import { HttpProgressRepository } from "../repositories/HttpProgressRepository";
import { HttpTrainingRepository } from "../repositories/HttpTrainingRepository";
import { FixtureTrainingReadModelsRepository } from "../repositories/FixtureTrainingReadModelsRepository";
import { TrainingRepository } from "../repositories/TrainingRepository";
import { HttpNutritionRepository } from "../repositories/HttpNutritionRepository";
import { HttpExerciseCatalogRepository } from "../repositories/HttpExerciseCatalogRepository";
import { HttpSettingsRepository } from "../repositories/HttpSettingsRepository";
import { HealthKitRepository } from "../repositories/HealthKitRepository";
import { HttpHealthSyncRepository } from "../repositories/HttpHealthSyncRepository";
import { HttpTodayRepository } from "../repositories/HttpTodayRepository";
import { HttpProgramRepository } from "../repositories/HttpProgramRepository";

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
import { GetProgressHistoryUseCase } from "@/application/progress/GetProgressHistoryUseCase";
import { GetProgressMeasureUseCase } from "@/application/progress/GetProgressMeasureUseCase";
import { GetProgressExerciseDetailUseCase } from "@/application/progress/GetProgressExerciseDetailUseCase";

import { GetRoutineDashboardUseCase } from "@/application/training/GetRoutineDashboardUseCase";
import { GetSessionFeedUseCase } from "@/application/training/GetSessionFeedUseCase";
import { GetExerciseLibraryUseCase } from "@/application/training/GetExerciseLibraryUseCase";
import { GetRoutineLibraryUseCase } from "@/application/training/GetRoutineLibraryUseCase";
import { GetRoutineDetailViewUseCase } from "@/application/training/GetRoutineDetailViewUseCase";
import { GetDayDetailViewUseCase } from "@/application/training/GetDayDetailViewUseCase";
import { GetSessionDetailViewUseCase } from "@/application/training/GetSessionDetailViewUseCase";
import { GetRoutinesUseCase } from "@/application/training/GetRoutinesUseCase";
import { GetRoutineDetailUseCase } from "@/application/training/GetRoutineDetailUseCase";
import { GetWorkoutDayExercisesUseCase } from "@/application/training/GetWorkoutDayExercisesUseCase";
import { GetExerciseConfigurationUseCase } from "@/application/training/GetExerciseConfigurationUseCase";
import { ListExercisesUseCase } from "@/application/training/ListExercisesUseCase";
import { GetExerciseCatalogDetailUseCase } from "@/application/training/GetExerciseCatalogDetailUseCase";
import { GetExerciseFiltersUseCase } from "@/application/training/GetExerciseFiltersUseCase";
import { GetProgressionPlanUseCase } from "@/application/training/GetProgressionPlanUseCase";

import { GetDietDashboardUseCase } from "@/application/nutrition/GetDietDashboardUseCase";
import { GetDietLibraryUseCase } from "@/application/nutrition/GetDietLibraryUseCase";
import { GetDietDetailUseCase } from "@/application/nutrition/GetDietDetailUseCase";
import { GetMealDetailUseCase } from "@/application/nutrition/GetMealDetailUseCase";
import { GetFoodDetailUseCase } from "@/application/nutrition/GetFoodDetailUseCase";
import { GetDietDayPlanUseCase } from "@/application/nutrition/GetDietDayPlanUseCase";
import { GetDiaryFeedUseCase } from "@/application/nutrition/GetDiaryFeedUseCase";
import { GetDiaryDayUseCase } from "@/application/nutrition/GetDiaryDayUseCase";
import { GetDailyMealLogsUseCase } from "@/application/nutrition/GetDailyMealLogsUseCase";
import { GetFoodLibraryUseCase } from "@/application/nutrition/GetFoodLibraryUseCase";
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
import { SyncHealthToPlatformUseCase } from "@/application/health/SyncHealthToPlatformUseCase";

import { GetTodayDashboardUseCase } from "@/application/today/GetTodayDashboardUseCase";
import { ListProgramsUseCase } from "@/application/program/ListProgramsUseCase";
import { GetActiveProgramUseCase } from "@/application/program/GetActiveProgramUseCase";
import { GetProgramUseCase } from "@/application/program/GetProgramUseCase";
import { GetProgramAdherenceUseCase } from "@/application/program/GetProgramAdherenceUseCase";
import { GetTimelineItemDetailUseCase } from "@/application/today/GetTimelineItemDetailUseCase";

import { track, identify } from "../analytics/analytics";
import * as onboardingDraftStore from "../storage/onboardingDraft";
import * as languagePreference from "../storage/languagePreference";
import * as lastAuthProvider from "../storage/lastAuthProvider";
import * as healthSyncAnchors from "../storage/healthSyncAnchors";
import { appVersion } from "../config/appConfig";

bootstrapInfrastructure();
// Wire auth cookie to API client at infrastructure initialization
apiClient.setGetCookie(() => authClient.getCookie());

// On a 401 the stored session is invalid (expired, revoked, or a stale cookie
// that survived a reinstall via the keychain). Self-clear it so the AuthGuard
// routes back to login instead of trapping the user on data screens that keep
// 401-ing. Guard against the burst of concurrent 401s firing this repeatedly.
let clearingInvalidSession = false;
apiClient.setUnauthorizedHandler(() => {
  if (clearingInvalidSession) return;
  clearingInvalidSession = true;
  // best-effort server sign-out — also wipes the local SecureStore cookie so a
  // later getSession can't resurrect the dead session.
  void authClient
    .signOut()
    .catch(() => {})
    .finally(() => {
      clearingInvalidSession = false;
    });
  // Flip the session to null now so the guard reacts on the next render.
  queryClient.setQueryData(["auth", "session"], null);
  queryClient.removeQueries({ queryKey: ["user", "currentUser"] });
});

const authRepo = new HttpAuthRepository();
const onboardingRepo = new HttpOnboardingRepository();
const analyticsRepo = new HttpAnalyticsRepository();
const sessionRepo = new HttpSessionRepository();
const activityRepo = new HttpActivityRepository();
const measurementsRepo = new HttpMeasurementsRepository();
const progressRepo = new HttpProgressRepository();
const trainingRepo = new TrainingRepository(
  new HttpTrainingRepository(),
  new FixtureTrainingReadModelsRepository()
);
const nutritionRepo = new HttpNutritionRepository();
const exerciseCatalogRepo = new HttpExerciseCatalogRepository();
const settingsRepo = new HttpSettingsRepository();
const healthRepo = new HealthKitRepository();
const healthSyncRepo = new HttpHealthSyncRepository();
const todayRepo = new HttpTodayRepository();
const programRepo = new HttpProgramRepository();

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
  // `lastAuthProvider`: last sign-in provider, for the login "Last used" hint.
  // `appInfo`: static build metadata (version) from expo-constants.
  telemetry: { track, identify },
  onboardingDraftStore,
  languagePreference,
  lastAuthProvider,
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

  // Progress (curated /api/v1/progress read-models — read-only)
  getProgressOverview: new GetProgressOverviewUseCase(progressRepo),
  getProgressHistory: new GetProgressHistoryUseCase(progressRepo),
  getProgressMeasure: new GetProgressMeasureUseCase(progressRepo),
  getProgressExerciseDetail: new GetProgressExerciseDetailUseCase(progressRepo),

  // Training (routines & workout days)
  getRoutineDashboard: new GetRoutineDashboardUseCase(trainingRepo),
  getSessionFeed: new GetSessionFeedUseCase(trainingRepo),
  getExerciseLibrary: new GetExerciseLibraryUseCase(trainingRepo),
  getRoutineLibrary: new GetRoutineLibraryUseCase(trainingRepo),
  getRoutineDetailView: new GetRoutineDetailViewUseCase(trainingRepo),
  getDayDetailView: new GetDayDetailViewUseCase(trainingRepo),
  getSessionDetailView: new GetSessionDetailViewUseCase(trainingRepo),
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
  getDietDashboard: new GetDietDashboardUseCase(nutritionRepo),
  getDietLibrary: new GetDietLibraryUseCase(nutritionRepo),
  getDietDetail: new GetDietDetailUseCase(nutritionRepo),
  getMealDetail: new GetMealDetailUseCase(nutritionRepo),
  getFoodDetail: new GetFoodDetailUseCase(nutritionRepo),
  getDietDayPlan: new GetDietDayPlanUseCase(nutritionRepo),
  getDiaryFeed: new GetDiaryFeedUseCase(nutritionRepo),
  getDiaryDay: new GetDiaryDayUseCase(nutritionRepo),
  getDailyMealLogs: new GetDailyMealLogsUseCase(nutritionRepo),
  getFoodLibrary: new GetFoodLibraryUseCase(nutritionRepo),
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
  // HealthKit → platform sync. The push side (HTTP) is live; the device-read
  // side (healthRepo) is stubbed inert until the native binding lands, so this
  // is a safe no-op in JS builds. Anchors persist via ephemeral SecureStore.
  syncHealthToPlatform: new SyncHealthToPlatformUseCase(
    healthRepo,
    healthSyncRepo,
    healthSyncAnchors,
  ),

  // Today ("Hoy" aggregate — GET /today eager + lazy timeline detail)
  getTodayDashboard: new GetTodayDashboardUseCase(todayRepo),
  getTimelineItemDetail: new GetTimelineItemDetailUseCase(todayRepo),

  // Programs (umbrella — library + detail + unified adherence; read-only)
  listPrograms: new ListProgramsUseCase(programRepo),
  getActiveProgram: new GetActiveProgramUseCase(programRepo),
  getProgram: new GetProgramUseCase(programRepo),
  getProgramAdherence: new GetProgramAdherenceUseCase(programRepo),
} as const;

export type Container = typeof container;
