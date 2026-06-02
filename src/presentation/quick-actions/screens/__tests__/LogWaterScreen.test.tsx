import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LogWaterScreen } from "../LogWaterScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/modals/log-water",
  useSegments: () => ["modals"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});

describe("LogWaterScreen", () => {
  it("shows progress bar with current water intake", async () => {
    const container = createMockContainer({
      getDailyWater: {
        execute: jest.fn().mockResolvedValue({ totalMl: 1500, date: "2026-03-27", logs: [] }),
      },
    });

    const { getByText } = renderWithProviders(<LogWaterScreen />, { container });

    await waitFor(() => {
      expect(getByText("1,500 ml")).toBeTruthy();
      expect(getByText("/ 2,500 ml")).toBeTruthy();
    });
  });

  it("renders quick-add buttons (150, 250, 500)", async () => {
    const { getByText } = renderWithProviders(<LogWaterScreen />);

    await waitFor(() => {
      // The amount ("+150") and unit ("ml") are separate Text nodes.
      expect(getByText("+150")).toBeTruthy();
      expect(getByText("+250")).toBeTruthy();
      expect(getByText("+500")).toBeTruthy();
    });
  });

  it("quick-add buttons call mutation with correct amount", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      logWater: { execute: executeMock },
    });

    const { getByText } = renderWithProviders(<LogWaterScreen />, { container });

    await waitFor(() => {
      expect(getByText("+250")).toBeTruthy();
    });

    fireEvent.press(getByText("+250"));

    await waitFor(() => {
      expect(executeMock).toHaveBeenCalledWith(250);
    });
  });

  it("custom input works", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      logWater: { execute: executeMock },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LogWaterScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("Amount in ml"), "350");
    fireEvent.press(getByText("Add"));

    await waitFor(() => {
      expect(executeMock).toHaveBeenCalledWith(350);
    });
  });
});
