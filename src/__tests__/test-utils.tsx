import React from "react";
import { render, renderHook, type RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a mock container factory with sensible defaults
export function createMockContainer(overrides: Partial<Record<string, any>> = {}) {
  const defaultMocks: Record<string, { execute: jest.Mock }> = {
    signIn: { execute: jest.fn() },
    signInGoogle: { execute: jest.fn().mockResolvedValue(undefined) },
    signInApple: { execute: jest.fn().mockResolvedValue(null) },
    signOut: { execute: jest.fn() },
    getSession: { execute: jest.fn().mockResolvedValue(null) },
    getCurrentUser: {
      execute: jest.fn().mockResolvedValue({
        id: "user-1",
        authUserId: "auth-1",
        email: "test@example.com",
        name: "Test User",
        username: "tester",
        hasAthleteProfile: true,
        language: null,
        currentHealthConsentVersion: "1",
      }),
    },
    getStreaks: {
      execute: jest.fn().mockResolvedValue({ current: 0, longest: 0, lastActiveDate: "" }),
    },
    getWeekView: { execute: jest.fn().mockResolvedValue({ days: [] }) },
    getDayState: {
      execute: jest.fn().mockResolvedValue({
        state: "REST_DAY",
        sessionsToday: 0,
        weekSessions: 0,
        weekTarget: 5,
      }),
    },
    getContributionGrid: { execute: jest.fn().mockResolvedValue([]) },
    getActiveSession: { execute: jest.fn().mockResolvedValue(null) },
    getLiveProgress: { execute: jest.fn().mockResolvedValue(null) },
    getDailySteps: { execute: jest.fn().mockResolvedValue(0) },
    getDailyWater: {
      execute: jest.fn().mockResolvedValue({ totalMl: 0, date: "", logs: [] }),
    },
    logWater: { execute: jest.fn().mockResolvedValue(undefined) },
    logSteps: {
      execute: jest.fn().mockResolvedValue({ id: "1", steps: 0, date: "" }),
    },
    logWeight: {
      execute: jest.fn().mockResolvedValue({ id: "1", weight: 0, unit: "kg", date: "" }),
    },
    getProgressOverview: {
      execute: jest.fn().mockResolvedValue({
        totalSessions: 0,
        totalVolume: 0,
        totalDuration: 0,
        currentStreak: 0,
        weekSummary: { sessions: 0, volume: 0, adherence: 0 },
      }),
    },
    getBodyComposition: {
      execute: jest.fn().mockResolvedValue({
        weightTrend: [],
        perimeterTrend: {},
        currentWeight: null,
        weightChange: null,
      }),
    },
    getExerciseStats: {
      execute: jest.fn().mockResolvedValue({
        totalVolume: 0,
        totalSets: 0,
        uniqueExercises: 0,
        trainingDays: 0,
        muscleGroups: [],
      }),
    },
    getExerciseDetail: { execute: jest.fn() },
    getRecords: { execute: jest.fn().mockResolvedValue([]) },
    getTimeline: { execute: jest.fn().mockResolvedValue([]) },
    getWeeks: { execute: jest.fn().mockResolvedValue([]) },
    getWeekDetail: { execute: jest.fn() },
    getMonths: { execute: jest.fn().mockResolvedValue([]) },
    getMonthDetail: { execute: jest.fn() },
    getSessionReport: { execute: jest.fn() },

    // Onboarding username check (reused by the settings Account editor).
    checkUsername: {
      execute: jest.fn().mockResolvedValue({ isAvailable: true, isValid: true }),
    },

    // Settings
    getAccount: {
      execute: jest.fn().mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        username: "tester",
        gender: "not_specified",
        dateOfBirth: null,
        heightCm: null,
        measurementSystem: "metric",
        experienceLevel: "beginner",
        primaryGoal: null,
        language: null,
        currentHealthConsentVersion: "1",
      }),
    },
    updateAccount: { execute: jest.fn().mockResolvedValue(undefined) },
    updatePreferences: { execute: jest.fn().mockResolvedValue(undefined) },
    getAthleteProfile: {
      execute: jest.fn().mockResolvedValue({
        username: "tester",
        displayName: "Test User",
        bio: null,
        avatarUrl: null,
        sportTags: [],
        isPublic: false,
        followerCount: 0,
        followingCount: 0,
        usernameChangedAt: null,
        sectionVisibility: { bio: true, training: true, bodyMetrics: true, nutrition: true },
        showcaseMetrics: [],
        timelineDetailLevel: "summary",
        requireFollowApproval: false,
      }),
    },
    updateAthleteProfile: { execute: jest.fn().mockResolvedValue(undefined) },
    updateUsername: { execute: jest.fn().mockResolvedValue(undefined) },
    uploadAvatar: { execute: jest.fn().mockResolvedValue(undefined) },
    removeAvatar: { execute: jest.fn().mockResolvedValue(undefined) },
    updateVisibility: { execute: jest.fn().mockResolvedValue(undefined) },
    updateShowcase: { execute: jest.fn().mockResolvedValue(undefined) },
    updateTimelineDetail: { execute: jest.fn().mockResolvedValue(undefined) },
    updateFollowApproval: { execute: jest.fn().mockResolvedValue(undefined) },
    getFeedSharing: {
      execute: jest.fn().mockResolvedValue({ training: false, nutrition: false, bodyMetrics: false }),
    },
    updateFeedSharing: { execute: jest.fn().mockResolvedValue(undefined) },
    listAuthSessions: {
      execute: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    },
    revokeSession: { execute: jest.fn().mockResolvedValue(undefined) },
    revokeAllSessions: {
      execute: jest.fn().mockResolvedValue({ revokedCount: 0, keptCurrent: true }),
    },
    listConnectedApps: { execute: jest.fn().mockResolvedValue([]) },
    revokeConnectedApp: { execute: jest.fn().mockResolvedValue(undefined) },
    updateConnectedAppScopes: { execute: jest.fn().mockResolvedValue(undefined) },
    requestDataExport: {
      execute: jest.fn().mockResolvedValue({
        id: "job-1",
        status: "requested",
        requestedAt: null,
        expiresAt: null,
      }),
    },
    getLatestExport: { execute: jest.fn().mockResolvedValue(null) },
    getExportJob: { execute: jest.fn() },
    deleteAccount: { execute: jest.fn().mockResolvedValue(undefined) },

    // Health (stub adapter — unavailable in JS test/dev builds)
    getHealthStatus: {
      execute: jest.fn().mockResolvedValue({
        available: false,
        connected: false,
        metrics: { weight: false, steps: false, water: false },
      }),
    },
    requestHealthAuthorization: {
      execute: jest.fn().mockResolvedValue({
        available: false,
        connected: false,
        metrics: { weight: false, steps: false, water: false },
      }),
    },
    setHealthMetric: {
      execute: jest.fn().mockResolvedValue({
        available: false,
        connected: false,
        metrics: { weight: false, steps: false, water: false },
      }),
    },
  };
  // Cross-cutting services (not use-cases) and static config.
  const services: Record<string, any> = {
    languagePreference: {
      getStoredLanguage: jest.fn().mockResolvedValue(null),
      setStoredLanguage: jest.fn().mockResolvedValue(undefined),
    },
    appInfo: { version: "0.0.0-test" },
    telemetry: { track: jest.fn(), identify: jest.fn() },
  };
  return { ...defaultMocks, ...services, ...overrides };
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// Mock the DIContext module so we can inject any container
jest.mock("@/infrastructure/di/DIContext", () => {
  const React = require("react") as typeof import("react");
  const DIContext = React.createContext<any>(null);
  return {
    DIProvider: ({ children, value }: { children: React.ReactNode; value: any }) => (
      <DIContext.Provider value={value}>{children}</DIContext.Provider>
    ),
    useDI: (selector: (c: any) => any) => {
      const ctx = React.useContext(DIContext);
      if (!ctx) throw new Error("useDI must be used within a DIProvider");
      return selector(ctx);
    },
  };
});

interface TestRenderOptions extends Omit<RenderOptions, "wrapper"> {
  container?: ReturnType<typeof createMockContainer>;
  queryClient?: QueryClient;
}

/**
 * Renders a React element wrapped with QueryClientProvider and DIProvider.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { container, queryClient, ...options }: TestRenderOptions = {}
) {
  const testQueryClient = queryClient ?? createTestQueryClient();
  const mockContainer = container ?? createMockContainer();

  const { DIProvider } = require("@/infrastructure/di/DIContext");

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <DIProvider value={mockContainer}>{children}</DIProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: testQueryClient,
    container: mockContainer,
  };
}

/**
 * Renders a hook wrapped with QueryClientProvider and DIProvider.
 */
// Dummy test so Jest does not fail with "must contain at least one test"
test("test-utils exports helpers", () => {
  expect(createMockContainer).toBeDefined();
  expect(createTestQueryClient).toBeDefined();
  expect(renderWithProviders).toBeDefined();
  expect(renderHookWithProviders).toBeDefined();
});

export function renderHookWithProviders<TResult>(
  callback: () => TResult,
  { container, queryClient }: Pick<TestRenderOptions, "container" | "queryClient"> = {}
) {
  const testQueryClient = queryClient ?? createTestQueryClient();
  const mockContainer = container ?? createMockContainer();

  const { DIProvider } = require("@/infrastructure/di/DIContext");

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <DIProvider value={mockContainer}>{children}</DIProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...renderHook(callback, { wrapper: Wrapper }),
    queryClient: testQueryClient,
    container: mockContainer,
  };
}
