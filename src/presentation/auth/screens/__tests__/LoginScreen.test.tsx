import React from "react";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { SignInCancelled } from "@/domain/auth";
import {
  createMockContainer,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { LoginScreen } from "../LoginScreen";

// The "Last used" badge query settles on a macrotask (TanStack's notifyManager
// batches re-renders via setTimeout). Tests that don't otherwise await it use
// this to absorb that final state update into act() and stay warning-free.
// Order matters: drain microtasks first so the (mocked) query promise resolves
// and schedules its notify timer, THEN flush that timer — otherwise our
// setTimeout can run before the notify is even queued, leaving a stray update.
const flushBadgeQuery = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Google and Apple sign-in buttons", async () => {
    const { findByText, getByTestId } = renderWithProviders(<LoginScreen />);

    expect(await findByText("Continue with Google")).toBeTruthy();
    expect(getByTestId("apple-signin-button")).toBeTruthy();
    await flushBadgeQuery();
  });

  it("shows a 'Last used' badge on the last provider used", async () => {
    const container = createMockContainer();
    container.lastAuthProvider.getLastAuthProvider.mockResolvedValue("google");

    const { findByTestId, queryByTestId } = renderWithProviders(<LoginScreen />, {
      container,
    });

    expect(await findByTestId("last-used-google")).toBeTruthy();
    expect(queryByTestId("last-used-apple")).toBeNull();
  });

  it("shows no 'Last used' badge on a fresh install", async () => {
    const { queryByTestId } = renderWithProviders(<LoginScreen />);

    await flushBadgeQuery();
    expect(queryByTestId("last-used-google")).toBeNull();
    expect(queryByTestId("last-used-apple")).toBeNull();
  });

  it("hides the reviewer form by default", async () => {
    const { queryByTestId } = renderWithProviders(<LoginScreen />);
    expect(queryByTestId("reviewer-form")).toBeNull();
    await flushBadgeQuery();
  });

  it("reveals the reviewer form after 7 taps on the logo", async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(<LoginScreen />);

    const logo = getByTestId("brand-logo-tap");
    for (let i = 0; i < 6; i++) fireEvent.press(logo);
    expect(queryByTestId("reviewer-form")).toBeNull();

    fireEvent.press(logo);
    expect(getByTestId("reviewer-form")).toBeTruthy();
    await flushBadgeQuery();
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
    await flushBadgeQuery();
  });

  it("triggers the Google use case on press", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      signInGoogle: { execute: executeMock },
    });

    const { getByTestId } = renderWithProviders(<LoginScreen />, { container });

    fireEvent.press(getByTestId("google-signin-button"));

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
    await flushBadgeQuery();
  });

  it("triggers the Apple use case on press", async () => {
    const executeMock = jest.fn().mockResolvedValue(null);
    const container = createMockContainer({
      signInApple: { execute: executeMock },
    });

    const { getByTestId } = renderWithProviders(<LoginScreen />, { container });

    fireEvent.press(getByTestId("apple-signin-button"));

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
    await flushBadgeQuery();
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
    await flushBadgeQuery();
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
    await flushBadgeQuery();
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
    await flushBadgeQuery();
  });
});
