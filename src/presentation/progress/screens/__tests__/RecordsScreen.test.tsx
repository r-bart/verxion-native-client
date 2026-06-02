import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { RecordsScreen } from "../RecordsScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/progress/records",
  useSegments: () => ["(tabs)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("RecordsScreen", () => {
  it("renders ScreenSelector", async () => {
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockResolvedValue([]) },
    });

    const { getByText, getAllByText } = renderWithProviders(<RecordsScreen />, {
      container,
    });

    await waitFor(() => {
      // The active option label ("Records") renders both as the heading and as
      // a pill, so it appears more than once.
      expect(getAllByText("Records").length).toBeGreaterThanOrEqual(1);
      expect(getByText("Overview")).toBeTruthy();
    });
  });

  it("shows records list", async () => {
    const records = [
      { exerciseId: "ex-1", exerciseName: "Bench Press", weight: 120, reps: 1, date: "2026-03-20T00:00:00Z" },
      { exerciseId: "ex-2", exerciseName: "Squat", weight: 160, reps: 3, date: "2026-03-18T00:00:00Z" },
    ];
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockResolvedValue(records) },
    });

    const { getByText } = renderWithProviders(<RecordsScreen />, { container });

    await waitFor(() => {
      // Weight value ("120") and unit ("kg") are separate Text nodes.
      expect(getByText("Bench Press")).toBeTruthy();
      expect(getByText("120")).toBeTruthy();
      expect(getByText("Squat")).toBeTruthy();
      expect(getByText("160")).toBeTruthy();
    });
  });

  it("filter input filters records", async () => {
    const records = [
      { exerciseId: "ex-1", exerciseName: "Bench Press", weight: 120, reps: 1, date: "2026-03-20T00:00:00Z" },
      { exerciseId: "ex-2", exerciseName: "Squat", weight: 160, reps: 3, date: "2026-03-18T00:00:00Z" },
    ];
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockResolvedValue(records) },
    });

    const { getByText, getByPlaceholderText, queryByText } = renderWithProviders(
      <RecordsScreen />,
      { container }
    );

    await waitFor(() => {
      expect(getByText("Bench Press")).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText("Search exercises..."), "Bench");

    await waitFor(() => {
      expect(getByText("Bench Press")).toBeTruthy();
      expect(queryByText("Squat")).toBeNull();
    });
  });

  it("shows empty state when no records", async () => {
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockResolvedValue([]) },
    });

    const { getByText } = renderWithProviders(<RecordsScreen />, { container });

    await waitFor(() => {
      expect(getByText("No personal records")).toBeTruthy();
    });
  });
});
