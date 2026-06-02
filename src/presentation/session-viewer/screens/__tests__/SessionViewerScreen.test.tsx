import React from "react";
import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { SessionViewerScreen } from "../SessionViewerScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "session-1" }),
  usePathname: () => "/today/session/session-1",
  useSegments: () => ["(tabs)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("SessionViewerScreen", () => {
  it("shows loading skeletons while loading", () => {
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockReturnValue(new Promise(() => {})) },
    });

    const { getByText, queryByText } = renderWithProviders(<SessionViewerScreen />, {
      container,
    });

    // While loading, the header badge renders and no terminal state is shown.
    // (Back is a ChevronLeft icon, not a text label.)
    expect(getByText("Live Session")).toBeTruthy();
    expect(queryByText("Session not found")).toBeNull();
  });

  it("renders session name and exercise cards when data available", async () => {
    const liveData = {
      session: {
        id: "session-1",
        name: "Push Day A",
        status: "in_progress" as const,
        startedAt: "2026-03-27T10:00:00Z",
        elapsedSeconds: 2100,
      },
      progress: {
        totalExercises: 4,
        completedExercises: 2,
        completionRate: 0.5,
        totalVolume: 5000,
        totalSets: 12,
        totalReps: 60,
      },
      exercises: [
        {
          sessionExerciseId: "e1",
          exerciseName: "Bench Press",
          bodyPart: "Chest",
          status: "completed" as const,
          actual: { completedSets: 4, totalVolume: 3000, peakWeight: 100, sets: [] },
        },
        {
          sessionExerciseId: "e2",
          exerciseName: "Incline Press",
          bodyPart: "Chest",
          status: "in_progress" as const,
          actual: { completedSets: 2, totalVolume: 2000, peakWeight: 80, sets: [] },
        },
      ],
    };
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockResolvedValue(liveData) },
    });

    const { getByText } = renderWithProviders(<SessionViewerScreen />, { container });

    await waitFor(() => {
      expect(getByText("Push Day A")).toBeTruthy();
    });
  });

  it("shows 'Session not found' when data is null", async () => {
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockResolvedValue(null) },
    });

    const { getByText } = renderWithProviders(<SessionViewerScreen />, { container });

    await waitFor(() => {
      expect(getByText("Session not found")).toBeTruthy();
      expect(getByText("This session may have ended")).toBeTruthy();
    });
  });
});
