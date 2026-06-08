import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { SettingsScreen } from "../SettingsScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
    dismissAll: jest.fn(),
    canDismiss: () => false,
    canGoBack: () => true,
  }),
}));

const mockChangeLanguage = jest.fn();
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en", changeLanguage: mockChangeLanguage } }),
}));

// Any icon used by the hub resolves to a null component.
jest.mock("lucide-react-native", () =>
  new Proxy({}, { get: () => () => null }),
);

describe("SettingsScreen (hub)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("signs out through the use case", async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({ signOut: { execute } });

    const { getByTestId } = renderWithProviders(<SettingsScreen />, { container });
    await waitFor(() => expect(container.getCurrentUser.execute).toHaveBeenCalled());
    fireEvent.press(getByTestId("sign-out"));

    await waitFor(() => expect(execute).toHaveBeenCalled());
    // Logout completes by redirecting to login; await it so the mutation's
    // post-success state updates settle inside act().
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(auth)/login"));
  });

  it("switches language via the toggle and persists it", async () => {
    const setStoredLanguage = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({ languagePreference: { setStoredLanguage } });

    const { getByTestId } = renderWithProviders(<SettingsScreen />, { container });
    await waitFor(() => expect(container.getCurrentUser.execute).toHaveBeenCalled());
    fireEvent.press(getByTestId("language-es"));

    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
    expect(setStoredLanguage).toHaveBeenCalledWith("es");
  });

  it("navigates back from the header", async () => {
    const container = createMockContainer();
    const { getByTestId } = renderWithProviders(<SettingsScreen />, { container });
    await waitFor(() => expect(container.getCurrentUser.execute).toHaveBeenCalled());
    fireEvent.press(getByTestId("settings-back"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("navigates to subscreens from the nav rows", async () => {
    const container = createMockContainer();
    const { getByTestId } = renderWithProviders(<SettingsScreen />, { container });
    await waitFor(() => expect(container.getCurrentUser.execute).toHaveBeenCalled());
    fireEvent.press(getByTestId("nav-account"));
    expect(mockPush).toHaveBeenCalledWith("/settings/account");
    fireEvent.press(getByTestId("nav-personal"));
    expect(mockPush).toHaveBeenCalledWith("/settings/personal");
  });

  it("shows the app version from the DI appInfo service", async () => {
    const container = createMockContainer({ appInfo: { version: "9.9.9" } });

    const { getByText } = renderWithProviders(<SettingsScreen />, { container });
    await waitFor(() => expect(container.getCurrentUser.execute).toHaveBeenCalled());
    expect(getByText("9.9.9")).toBeTruthy();
  });
});
