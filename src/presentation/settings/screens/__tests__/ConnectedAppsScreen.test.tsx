import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { ConnectedAppsScreen } from "../ConnectedAppsScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

const APP = {
  clientId: "c1",
  appName: "ChatGPT",
  scopes: ["workouts.read"],
  categories: [
    { key: "workouts", active: true, destructive: false },
    { key: "nutrition", active: false, destructive: false },
  ],
  authorizedAt: null,
  tokenCount: 1,
};

describe("ConnectedAppsScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the empty state when there are no apps", async () => {
    const { findByText } = renderWithProviders(<ConnectedAppsScreen />);
    expect(await findByText("settings.screens.connectedApps.empty")).toBeTruthy();
  });

  it("revokes an app after confirmation", async () => {
    const container = createMockContainer({
      listConnectedApps: { execute: jest.fn().mockResolvedValue([APP]) },
    });
    const { findByTestId, getByTestId, container: c } = renderWithProviders(<ConnectedAppsScreen />, { container });

    fireEvent.press(await findByTestId("revoke-app-c1"));
    fireEvent.press(getByTestId("confirm-accept"));
    await waitFor(() => expect(c.revokeConnectedApp.execute).toHaveBeenCalledWith("c1"));
  });

  it("updates scopes when a category is toggled on", async () => {
    const container = createMockContainer({
      listConnectedApps: { execute: jest.fn().mockResolvedValue([APP]) },
    });
    const { findByTestId, container: c } = renderWithProviders(<ConnectedAppsScreen />, { container });

    fireEvent(await findByTestId("scope-c1-nutrition"), "valueChange", true);
    await waitFor(() =>
      expect(c.updateConnectedAppScopes.execute).toHaveBeenCalledWith({
        clientId: "c1",
        categories: ["workouts", "nutrition"],
        includeDestructive: false,
      }),
    );
  });
});
