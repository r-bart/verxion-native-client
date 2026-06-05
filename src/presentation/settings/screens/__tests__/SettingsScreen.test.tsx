import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { SettingsScreen } from "../SettingsScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: mockBack, push: mockPush }) }));

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
    fireEvent.press(getByTestId("sign-out"));

    await waitFor(() => expect(execute).toHaveBeenCalled());
  });

  it("switches language via the toggle and persists it", () => {
    const setStoredLanguage = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({ languagePreference: { setStoredLanguage } });

    const { getByTestId } = renderWithProviders(<SettingsScreen />, { container });
    fireEvent.press(getByTestId("language-es"));

    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
    expect(setStoredLanguage).toHaveBeenCalledWith("es");
  });

  it("navigates back from the header", () => {
    const { getByTestId } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByTestId("settings-back"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("navigates to subscreens from the nav rows", () => {
    const { getByTestId } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByTestId("nav-account"));
    expect(mockPush).toHaveBeenCalledWith("/settings/account");
    fireEvent.press(getByTestId("nav-personal"));
    expect(mockPush).toHaveBeenCalledWith("/settings/personal");
  });

  it("shows the app version from the DI appInfo service", () => {
    const container = createMockContainer({ appInfo: { version: "9.9.9" } });

    const { getByText } = renderWithProviders(<SettingsScreen />, { container });
    expect(getByText("9.9.9")).toBeTruthy();
  });
});
