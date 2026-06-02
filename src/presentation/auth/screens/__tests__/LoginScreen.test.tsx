import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { SignInCancelled } from "@/domain/auth";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LoginScreen } from "../LoginScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Google and Apple sign-in buttons", () => {
    const { getByText, getByTestId } = renderWithProviders(<LoginScreen />);

    expect(getByText("Continue with Google")).toBeTruthy();
    expect(getByTestId("apple-signin-button")).toBeTruthy();
  });

  it("hides the reviewer form by default", () => {
    const { queryByTestId } = renderWithProviders(<LoginScreen />);
    expect(queryByTestId("reviewer-form")).toBeNull();
  });

  it("reveals the reviewer form after 7 taps on the logo", () => {
    const { getByTestId, queryByTestId } = renderWithProviders(<LoginScreen />);

    const logo = getByTestId("brand-logo-tap");
    for (let i = 0; i < 6; i++) fireEvent.press(logo);
    expect(queryByTestId("reviewer-form")).toBeNull();

    fireEvent.press(logo);
    expect(getByTestId("reviewer-form")).toBeTruthy();
  });

  it("signs in via the reviewer use case", async () => {
    const executeMock = jest.fn().mockResolvedValue(null);
    const container = createMockContainer({
      signIn: { execute: executeMock },
    });

    const { getByTestId } = renderWithProviders(<LoginScreen />, { container });

    const logo = getByTestId("brand-logo-tap");
    for (let i = 0; i < 7; i++) fireEvent.press(logo);

    fireEvent.changeText(getByTestId("email-input"), "reviewer@example.com");
    fireEvent.changeText(getByTestId("password-input"), "secret-pass");
    fireEvent.press(getByTestId("reviewer-submit"));

    // TanStack Query v5 passes a mutation context as a second arg, so match the
    // credentials on the first arg and allow anything after.
    await waitFor(() =>
      expect(executeMock).toHaveBeenCalledWith(
        { email: "reviewer@example.com", password: "secret-pass" },
        expect.anything()
      )
    );
  });

  it("triggers the Google use case on press", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      signInGoogle: { execute: executeMock },
    });

    const { getByTestId } = renderWithProviders(<LoginScreen />, { container });

    fireEvent.press(getByTestId("google-signin-button"));

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
  });

  it("triggers the Apple use case on press", async () => {
    const executeMock = jest.fn().mockResolvedValue(null);
    const container = createMockContainer({
      signInApple: { execute: executeMock },
    });

    const { getByTestId } = renderWithProviders(<LoginScreen />, { container });

    fireEvent.press(getByTestId("apple-signin-button"));

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
  });

  it("stays silent when Apple sign-in is cancelled", async () => {
    const container = createMockContainer({
      signInApple: {
        execute: jest.fn().mockRejectedValue(new SignInCancelled()),
      },
    });

    const { getByTestId, queryByTestId } = renderWithProviders(<LoginScreen />, {
      container,
    });

    fireEvent.press(getByTestId("apple-signin-button"));

    await waitFor(() =>
      expect(container.signInApple.execute).toHaveBeenCalled()
    );
    expect(queryByTestId("login-error")).toBeNull();
  });

  it("shows an error message when Google sign-in fails", async () => {
    const container = createMockContainer({
      signInGoogle: {
        execute: jest.fn().mockRejectedValue(new Error("Google sign in failed")),
      },
    });

    const { getByTestId, getByText } = renderWithProviders(<LoginScreen />, {
      container,
    });

    fireEvent.press(getByTestId("google-signin-button"));

    await waitFor(() =>
      expect(getByText("Google sign in failed")).toBeTruthy()
    );
  });

  it("does not show a stale provider error after switching providers", async () => {
    const container = createMockContainer({
      signInGoogle: {
        execute: jest.fn().mockRejectedValue(new Error("Google sign in failed")),
      },
      signInApple: {
        execute: jest.fn().mockRejectedValue(new SignInCancelled()),
      },
    });

    const { getByTestId, getByText, queryByTestId } = renderWithProviders(
      <LoginScreen />,
      { container }
    );

    fireEvent.press(getByTestId("google-signin-button"));
    await waitFor(() => expect(getByText("Google sign in failed")).toBeTruthy());

    // Switching to Apple (which cancels) must clear the stale Google error.
    fireEvent.press(getByTestId("apple-signin-button"));
    await waitFor(() =>
      expect(container.signInApple.execute).toHaveBeenCalled()
    );
    expect(queryByTestId("login-error")).toBeNull();
  });
});
