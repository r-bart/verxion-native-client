import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { PrivacyScreen } from "../PrivacyScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("PrivacyScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("toggling a visibility switch sends the full updated object", async () => {
    const { findByTestId, container: c } = renderWithProviders(<PrivacyScreen />);
    // Default mock: all sections visible → toggling bio off sends bio:false.
    fireEvent(await findByTestId("visibility-bio"), "valueChange", false);
    await waitFor(() =>
      expect(c.updateVisibility.execute).toHaveBeenCalledWith({
        bio: false,
        training: true,
        bodyMetrics: true,
        nutrition: true,
      }),
    );
  });

  it("selecting a showcase metric sends the new array", async () => {
    const { findByTestId, container: c } = renderWithProviders(<PrivacyScreen />);
    fireEvent.press(await findByTestId("showcase-total_volume"));
    await waitFor(() =>
      expect(c.updateShowcase.execute).toHaveBeenCalledWith(["total_volume"]),
    );
  });

  it("switching the timeline detail level sends the new level", async () => {
    const { findByTestId, container: c } = renderWithProviders(<PrivacyScreen />);
    fireEvent.press(await findByTestId("timeline-detailed"));
    await waitFor(() => expect(c.updateTimelineDetail.execute).toHaveBeenCalledWith("detailed"));
  });

  it("toggling a feed-sharing switch sends the full settings object", async () => {
    const { findByTestId, container: c } = renderWithProviders(<PrivacyScreen />);
    fireEvent(await findByTestId("feed-training"), "valueChange", true);
    await waitFor(() =>
      expect(c.updateFeedSharing.execute).toHaveBeenCalledWith({
        training: true,
        nutrition: false,
        bodyMetrics: false,
      }),
    );
  });

  it("reverts the local toggle when the write fails", async () => {
    const container = createMockContainer({
      updateFollowApproval: { execute: jest.fn().mockRejectedValue(new Error("boom")) },
    });
    const { findByTestId } = renderWithProviders(<PrivacyScreen />, { container });
    const toggle = await findByTestId("follow-approval");
    fireEvent(toggle, "valueChange", true);
    // After the rejected mutation, the optimistic flip is reverted to false.
    await waitFor(() => expect(toggle.props.value).toBe(false));
  });
});
