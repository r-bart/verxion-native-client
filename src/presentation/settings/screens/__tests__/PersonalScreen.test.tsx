import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "@/__tests__/test-utils";
import { PersonalScreen } from "../PersonalScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));
jest.mock("@react-native-community/datetimepicker", () => () => null);

describe("PersonalScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("saves a changed personal field via updateAccount only", async () => {
    const { findByTestId, getByTestId, container } = renderWithProviders(<PersonalScreen />);

    fireEvent.press(await findByTestId("option-female"));
    fireEvent.press(getByTestId("settings-save"));

    await waitFor(() =>
      expect(container.updateAccount.execute).toHaveBeenCalledWith({ sex: "female" }),
    );
    expect(container.updatePreferences.execute).not.toHaveBeenCalled();
  });

  it("saves the primary goal via the preferences endpoint", async () => {
    const { findByTestId, getByTestId, container } = renderWithProviders(<PersonalScreen />);

    fireEvent.press(await findByTestId("option-strength"));
    fireEvent.press(getByTestId("settings-save"));

    await waitFor(() =>
      expect(container.updatePreferences.execute).toHaveBeenCalledWith({
        fitnessPreferences: { primaryGoal: "strength" },
      }),
    );
    expect(container.updateAccount.execute).not.toHaveBeenCalled();
  });
});
