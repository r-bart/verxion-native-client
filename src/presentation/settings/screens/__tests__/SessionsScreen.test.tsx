import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { SessionsScreen } from "../SessionsScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

const SESSIONS = {
  items: [
    { id: "s1", kind: "session", clientId: null, createdAt: null, expiresAt: null, lastActiveAt: null, ipAddress: null, isCurrent: true, display: "Chrome on macOS" },
    { id: "s2", kind: "oauth_access_token", clientId: "app", createdAt: null, expiresAt: null, lastActiveAt: null, ipAddress: null, isCurrent: false, display: "API token" },
  ],
  total: 2,
};

describe("SessionsScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("revokes an individual non-current session", async () => {
    const container = createMockContainer({
      listAuthSessions: { execute: jest.fn().mockResolvedValue(SESSIONS) },
    });
    const { findByTestId, container: c } = renderWithProviders(<SessionsScreen />, { container });

    fireEvent.press(await findByTestId("session-revoke-s2"));
    await waitFor(() => expect(c.revokeSession.execute).toHaveBeenCalledWith("s2"));
  });

  it("signs out everywhere after confirmation", async () => {
    const container = createMockContainer({
      listAuthSessions: { execute: jest.fn().mockResolvedValue(SESSIONS) },
    });
    const { findByTestId, getByTestId, container: c } = renderWithProviders(<SessionsScreen />, { container });

    fireEvent.press(await findByTestId("sign-out-everywhere"));
    fireEvent.press(getByTestId("confirm-accept"));
    await waitFor(() => expect(c.revokeAllSessions.execute).toHaveBeenCalledWith(true));
  });

  it("shows the empty state when there are no sessions", async () => {
    const container = createMockContainer({
      listAuthSessions: { execute: jest.fn().mockResolvedValue({ items: [], total: 0 }) },
    });
    const { findByText } = renderWithProviders(<SessionsScreen />, { container });

    expect(await findByText("settings.screens.sessions.empty")).toBeTruthy();
  });
});
