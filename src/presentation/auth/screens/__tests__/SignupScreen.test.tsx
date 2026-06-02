import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { SignupScreen } from "../SignupScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/(auth)/signup",
  useSegments: () => ["(auth)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("SignupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders name, email, and password inputs", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("renders Create Account button", () => {
    const { getAllByText } = renderWithProviders(<SignupScreen />);

    // Both the heading and button contain "Create Account"
    expect(getAllByText("Create Account").length).toBeGreaterThanOrEqual(1);
  });

  it("Create Account button is disabled when fields are empty", () => {
    const container = createMockContainer({
      signUp: { execute: jest.fn() },
    });

    const { getAllByText } = renderWithProviders(<SignupScreen />, { container });

    // Press the last "Create Account" element (the button)
    const elements = getAllByText("Create Account");
    fireEvent.press(elements[elements.length - 1]);
    expect(container.signUp.execute).not.toHaveBeenCalled();
  });

  it("calls mutation on button press with name/email/password", async () => {
    const executeMock = jest.fn().mockResolvedValue({ id: "u1" });
    const container = createMockContainer({
      signUp: { execute: executeMock },
    });

    const { getAllByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("Name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Email"), "john@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "secure123");
    const elements = getAllByText("Create Account");
    fireEvent.press(elements[elements.length - 1]);

    await waitFor(() => {
      expect(executeMock).toHaveBeenCalled();
    });
  });

  it("shows error message when mutation fails", async () => {
    const container = createMockContainer({
      signUp: { execute: jest.fn().mockRejectedValue(new Error("Email already taken")) },
    });

    const { getAllByText, getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("Name"), "John");
    fireEvent.changeText(getByPlaceholderText("Email"), "taken@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "pass");
    const elements = getAllByText("Create Account");
    fireEvent.press(elements[elements.length - 1]);

    await waitFor(() => {
      expect(getByText("Email already taken")).toBeTruthy();
    });
  });
});
