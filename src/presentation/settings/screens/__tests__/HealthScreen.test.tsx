import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { HealthScreen } from "../HealthScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("HealthScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the unavailable state with the stub adapter", async () => {
    const { findByTestId } = renderWithProviders(<HealthScreen />);
    expect(await findByTestId("health-unavailable")).toBeTruthy();
  });

  it("requests authorization when available but not connected", async () => {
    const container = createMockContainer({
      getHealthStatus: {
        execute: jest.fn().mockResolvedValue({
          available: true,
          connected: false,
          metrics: { weight: false, steps: false, cardio: false },
        }),
      },
    });
    const { findByTestId, container: c } = renderWithProviders(<HealthScreen />, { container });

    fireEvent.press(await findByTestId("health-connect"));
    await waitFor(() => expect(c.requestHealthAuthorization.execute).toHaveBeenCalled());
  });
});
