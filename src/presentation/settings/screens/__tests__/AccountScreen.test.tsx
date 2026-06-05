import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "@/__tests__/test-utils";
import { AccountScreen } from "../AccountScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("AccountScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("seeds fields from the profile and shows the read-only email", async () => {
    const { findByTestId, getByTestId } = renderWithProviders(<AccountScreen />);
    const username = await findByTestId("account-username");
    expect(username.props.value).toBe("tester");
    expect(getByTestId("account-display-name").props.value).toBe("Test User");
    expect(getByTestId("account-email").props.value).toBe("test@example.com");
    expect(getByTestId("account-email").props.editable).toBe(false);
  });

  it("saves an edited display name through the profile use case", async () => {
    const { findByTestId, getByTestId, container } = renderWithProviders(<AccountScreen />);

    fireEvent.changeText(await findByTestId("account-display-name"), "New Name");
    fireEvent.press(getByTestId("settings-save"));

    await waitFor(() =>
      expect(container.updateAthleteProfile.execute).toHaveBeenCalledWith({
        displayName: "New Name",
        bio: "",
      }),
    );
    // Username unchanged → username endpoint not touched.
    expect(container.updateUsername.execute).not.toHaveBeenCalled();
    // The mutation reports success to telemetry.
    await waitFor(() =>
      expect(container.telemetry.track).toHaveBeenCalledWith("settings_profile_updated"),
    );
  });

  it("hides the save bar until a field changes, and discard resets it", async () => {
    const { findByTestId, getByTestId, queryByTestId } = renderWithProviders(<AccountScreen />);
    const displayName = await findByTestId("account-display-name");
    expect(queryByTestId("settings-save")).toBeNull();

    fireEvent.changeText(displayName, "Changed");
    expect(queryByTestId("settings-save")).not.toBeNull();

    fireEvent.press(getByTestId("settings-discard"));
    expect(queryByTestId("settings-save")).toBeNull();
  });
});
