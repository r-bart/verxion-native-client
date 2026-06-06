import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "@/__tests__/test-utils";
import { DataScreen } from "../DataScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

// With the mocked `t`, the confirm word resolves to its key.
const DELETE_WORD = "settings.screens.data.deleteConfirmWord";

describe("DataScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requests a data export", async () => {
    const { getByTestId, container } = renderWithProviders(<DataScreen />);
    fireEvent.press(getByTestId("request-export"));
    await waitFor(() => expect(container.requestDataExport.execute).toHaveBeenCalled());
  });

  it("only deletes the account after typing the confirmation word", async () => {
    const { getByTestId, container } = renderWithProviders(<DataScreen />);

    fireEvent.press(getByTestId("delete-account"));
    // Confirm is disabled until the exact word is typed.
    fireEvent.press(getByTestId("confirm-accept"));
    expect(container.deleteAccount.execute).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId("delete-confirm-input"), DELETE_WORD);
    fireEvent.press(getByTestId("confirm-accept"));
    await waitFor(() => expect(container.deleteAccount.execute).toHaveBeenCalled());
  });
});
