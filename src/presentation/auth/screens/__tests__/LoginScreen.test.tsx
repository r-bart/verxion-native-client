import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LoginScreen } from "../LoginScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/(auth)/login",
  useSegments: () => ["(auth)"],
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    const { getByPlaceholderText } = renderWithProviders(<LoginScreen />);

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("renders Sign In button", () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    expect(getByText("Sign In")).toBeTruthy();
  });

  it("Sign In button is disabled when fields are empty", () => {
    const container = createMockContainer({
      signIn: { execute: jest.fn() },
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />,
      { container }
    );

    // Press sign in without filling fields
    fireEvent.press(getByText("Sign In"));
    // The mutation should not have been called
    expect(container.signIn.execute).not.toHaveBeenCalled();
  });

  it("calls mutation on button press with email/password", async () => {
    const executeMock = jest.fn().mockResolvedValue({ token: "abc" });
    const container = createMockContainer({
      signIn: { execute: executeMock },
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      // The hook uses execute.bind(uc) as mutationFn, so the mock is called
      expect(executeMock).toHaveBeenCalled();
    });
  });

  it("shows error message when mutation fails", async () => {
    const container = createMockContainer({
      signIn: { execute: jest.fn().mockRejectedValue(new Error("Invalid credentials")) },
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />,
      { container }
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "wrong@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "badpass");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(getByText("Invalid credentials")).toBeTruthy();
    });
  });
});
