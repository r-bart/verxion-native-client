import { authClient } from "../auth/authClient";
import { apiClient } from "../api/apiClient";
import { HttpAuthRepository } from "../repositories/HttpAuthRepository";
import { HttpAnalyticsRepository } from "../repositories/HttpAnalyticsRepository";
import { HttpSessionRepository } from "../repositories/HttpSessionRepository";
import { HttpActivityRepository } from "../repositories/HttpActivityRepository";
import { HttpMeasurementsRepository } from "../repositories/HttpMeasurementsRepository";
import { HttpProgressRepository } from "../repositories/HttpProgressRepository";
import { HttpTrainingRepository } from "../repositories/HttpTrainingRepository";
import { HttpNutritionRepository } from "../repositories/HttpNutritionRepository";
import { HttpExerciseCatalogRepository } from "../repositories/HttpExerciseCatalogRepository";

import { SignInUseCase } from "@/application/auth/SignInUseCase";
import { SignInWithGoogleUseCase } from "@/application/auth/SignInWithGoogleUseCase";
import { SignInWithAppleUseCase } from "@/application/auth/SignInWithAppleUseCase";
import { SignOutUseCase } from "@/application/auth/SignOutUseCase";
import { GetSessionUseCase } from "@/application/auth/GetSessionUseCase";

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

// Wire auth cookie to API client at infrastructure initialization
apiClient.setGetCookie(() => authClient.getCookie());

const authRepo = new HttpAuthRepository();
const analyticsRepo = new HttpAnalyticsRepository();
const sessionRepo = new HttpSessionRepository();
const activityRepo = new HttpActivityRepository();
const measurementsRepo = new HttpMeasurementsRepository();
const progressRepo = new HttpProgressRepository();
const trainingRepo = new HttpTrainingRepository();
const nutritionRepo = new HttpNutritionRepository();
const exerciseCatalogRepo = new HttpExerciseCatalogRepository();

export const container = {
  // Auth
  signIn: new SignInUseCase(authRepo),
  signInGoogle: new SignInWithGoogleUseCase(authRepo),
  signInApple: new SignInWithAppleUseCase(authRepo),
  signOut: new SignOutUseCase(authRepo),
  getSession: new GetSessionUseCase(authRepo),

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
} as const;

export type Container = typeof container;
