import React from "react";
import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { TodayScreen } from "../TodayScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/today",
  useSegments: () => ["(tabs)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// The Today dashboard composes GreetingHeader + TrainingStateCard +
// NutritionDayCard + WeeklyRingsCard. Quick actions live in modals and the
// active-session banner is the global FloatingSessionBanner — neither is part
// of this screen, so they are not asserted here.
describe("TodayScreen", () => {
  it("renders the greeting with the user's first name", async () => {
    const container = createMockContainer({
      getSession: {
        execute: jest.fn().mockResolvedValue({
          user: { id: "u1", name: "John Doe", email: "john@test.com" },
        }),
      },
      getStreaks: {
        execute: jest
          .fn()
          .mockResolvedValue({ current: 3, longest: 10, lastActiveDate: "2026-03-27" }),
      },
    });

    const { getByText } = renderWithProviders(<TodayScreen />, { container });

    await waitFor(() => {
      expect(getByText(/John/)).toBeTruthy();
    });
  });

  it("renders the streak count when there is an active streak", async () => {
    const container = createMockContainer({
      getStreaks: {
        execute: jest
          .fn()
          .mockResolvedValue({ current: 7, longest: 12, lastActiveDate: "2026-03-27" }),
      },
    });

    const { getByText } = renderWithProviders(<TodayScreen />, { container });

    await waitFor(() => {
      expect(getByText("7")).toBeTruthy();
    });
  });

  it("renders the Rest Day training state by default", async () => {
    const { getByText } = renderWithProviders(<TodayScreen />);

    await waitFor(() => {
      expect(getByText("Rest Day")).toBeTruthy();
      expect(getByText("Recovery is part of the process")).toBeTruthy();
    });
  });

  it("renders the Workout Planned state when a workout is scheduled", async () => {
    const container = createMockContainer({
      getDayState: {
        execute: jest.fn().mockResolvedValue({
          state: "WORKOUT_PLANNED",
          sessionsToday: 0,
          weekSessions: 2,
          weekTarget: 5,
        }),
      },
    });

    const { getByText } = renderWithProviders(<TodayScreen />, { container });

    await waitFor(() => {
      expect(getByText("Workout Planned")).toBeTruthy();
      expect(getByText("Ready to go!")).toBeTruthy();
    });
  });

  it("renders the dashboard section headers", async () => {
    const { getAllByText } = renderWithProviders(<TodayScreen />);

    await waitFor(() => {
      // "Training" also appears in the WeeklyRings legend, so there may be more
      // than one match — assert at least the section header is present.
      expect(getAllByText("Training").length).toBeGreaterThanOrEqual(1);
      expect(getAllByText("This Week").length).toBeGreaterThanOrEqual(1);
    });
  });
});
