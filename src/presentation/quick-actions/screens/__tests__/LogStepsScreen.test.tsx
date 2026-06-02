import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LogStepsScreen } from "../LogStepsScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/modals/log-steps",
  useSegments: () => ["modals"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});

describe("LogStepsScreen", () => {
  it("renders steps input", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<LogStepsScreen />);

    expect(getByPlaceholderText("0")).toBeTruthy();
    expect(getByText("steps")).toBeTruthy();
    expect(getByText("Log Steps")).toBeTruthy();
  });

  it("shows current steps when available", async () => {
    const container = createMockContainer({
      getDailySteps: { execute: jest.fn().mockResolvedValue(5432) },
    });

    const { getByText } = renderWithProviders(<LogStepsScreen />, { container });

    await waitFor(() => {
      // Copy: "Today you've logged <5,432> steps, …" — assert the formatted value node.
      expect(getByText("5,432")).toBeTruthy();
    });
  });

  it("validates max 200000", async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<LogStepsScreen />);

    fireEvent.changeText(getByPlaceholderText("0"), "300000");

    await waitFor(() => {
      expect(getByText("Enter a valid number (0 - 200,000)")).toBeTruthy();
    });
  });

  it("calls mutation on submit", async () => {
    const executeMock = jest.fn().mockResolvedValue({ id: "s1", steps: 10000, date: "2026-03-27" });
    const container = createMockContainer({
      logSteps: { execute: executeMock },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LogStepsScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("0"), "10000");
    fireEvent.press(getByText("Save Steps"));

    await waitFor(() => {
      expect(executeMock).toHaveBeenCalledWith(10000);
    });
  });

  it("Save button disabled when input is empty", () => {
    const container = createMockContainer({
      logSteps: { execute: jest.fn() },
    });

    const { getByText } = renderWithProviders(<LogStepsScreen />, { container });

    fireEvent.press(getByText("Save Steps"));
    expect(container.logSteps.execute).not.toHaveBeenCalled();
  });
});
