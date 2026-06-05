import { Linking } from "react-native";
import { fireEvent } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { AboutScreen } from "../AboutScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("AboutScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the app version and opens the terms link", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(true as any);
    const container = createMockContainer({ appInfo: { version: "1.2.3" } });

    const { getByText, getByTestId } = renderWithProviders(<AboutScreen />, { container });
    expect(getByText("1.2.3")).toBeTruthy();

    fireEvent.press(getByTestId("about-terms"));
    expect(spy).toHaveBeenCalledWith("https://verxion.ai/terms");
  });
});
