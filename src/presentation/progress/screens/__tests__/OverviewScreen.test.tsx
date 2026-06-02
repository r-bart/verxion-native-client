import React from "react";
import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { OverviewScreen } from "../OverviewScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/progress",
  useSegments: () => ["(tabs)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("OverviewScreen", () => {
  it("renders ScreenSelector with progressScreens", async () => {
    const container = createMockContainer({
      getProgressOverview: {
        execute: jest.fn().mockResolvedValue({
          totalSessions: 42,
          totalVolume: 150000,
          totalDuration: 1260,
          currentStreak: 5,
          weekSummary: { sessions: 3, volume: 12000, adherence: 60 },
        }),
      },
    });

    const { getByText, getAllByText } = renderWithProviders(<OverviewScreen />, {
      container,
    });

    await waitFor(() => {
      // The active option label ("Overview") renders both as the heading and as
      // a pill, so it appears more than once.
      expect(getAllByText("Overview").length).toBeGreaterThanOrEqual(1);
      expect(getByText("Body Comp")).toBeTruthy();
      expect(getByText("Records")).toBeTruthy();
    });
  });

  it("shows metric cards with data", async () => {
    const container = createMockContainer({
      getProgressOverview: {
        execute: jest.fn().mockResolvedValue({
          totalSessions: 42,
          totalVolume: 150000,
          totalDuration: 65,
          currentStreak: 5,
          weekSummary: { sessions: 3, volume: 12000, adherence: 60 },
        }),
      },
    });

    const { getByText } = renderWithProviders(<OverviewScreen />, { container });

    await waitFor(() => {
      expect(getByText("Total Sessions")).toBeTruthy();
      expect(getByText("42")).toBeTruthy();
      expect(getByText("Total Volume (tons)")).toBeTruthy();
      expect(getByText("Current Streak")).toBeTruthy();
      expect(getByText("5")).toBeTruthy();
    });
  });

  it("shows quick access grid", async () => {
    const container = createMockContainer({
      getProgressOverview: {
        execute: jest.fn().mockResolvedValue({
          totalSessions: 0,
          totalVolume: 0,
          totalDuration: 0,
          currentStreak: 0,
          weekSummary: { sessions: 0, volume: 0, adherence: 0 },
        }),
      },
    });

    const { getByText, getAllByText } = renderWithProviders(<OverviewScreen />, { container });

    await waitFor(() => {
      expect(getByText("Analytics")).toBeTruthy();
      expect(getByText("Timeline")).toBeTruthy();
      expect(getByText("Weeks")).toBeTruthy();
      expect(getByText("Months")).toBeTruthy();
      // "Exercises" appears in both ScreenSelector and quick access grid
      expect(getAllByText("Exercises").length).toBeGreaterThanOrEqual(1);
    });
  });
});
