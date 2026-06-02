import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LogWeightScreen } from "../LogWeightScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/modals/log-weight",
  useSegments: () => ["modals"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Alert
jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});

describe("LogWeightScreen", () => {
  it("renders weight input", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<LogWeightScreen />);

    expect(getByPlaceholderText("0.0")).toBeTruthy();
    expect(getByText("kg")).toBeTruthy();
    expect(getByText("Log Weight")).toBeTruthy();
  });

  it("Save button is disabled when empty", () => {
    const container = createMockContainer({
      logWeight: { execute: jest.fn() },
    });

    const { getByText } = renderWithProviders(<LogWeightScreen />, { container });

    fireEvent.press(getByText("Save Weight"));
    expect(container.logWeight.execute).not.toHaveBeenCalled();
  });

  it("validates weight > 0 and <= 635", async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(
      <LogWeightScreen />
    );

    // Enter invalid weight (0)
    fireEvent.changeText(getByPlaceholderText("0.0"), "0");
    await waitFor(() => {
      expect(getByText("Enter a valid weight (0.1 - 635 kg)")).toBeTruthy();
    });

    // Enter weight > 635
    fireEvent.changeText(getByPlaceholderText("0.0"), "700");
    await waitFor(() => {
      expect(getByText("Enter a valid weight (0.1 - 635 kg)")).toBeTruthy();
    });

    // Enter valid weight
    fireEvent.changeText(getByPlaceholderText("0.0"), "80.5");
    await waitFor(() => {
      expect(queryByText("Enter a valid weight (0.1 - 635 kg)")).toBeNull();
    });
  });

  it("calls mutation with parsed number", async () => {
    const executeMock = jest.fn().mockResolvedValue({ id: "w1", weight: 80.5, unit: "kg" });
    const container = createMockContainer({
      logWeight: { execute: executeMock },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LogWeightScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("0.0"), "80.5");
    fireEvent.press(getByText("Save Weight"));

    await waitFor(() => {
      expect(executeMock).toHaveBeenCalledWith(80.5);
    });
  });
});
