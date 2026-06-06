import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { sessionFeedFixture } from "@/domain/training/__fixtures__/sessionFeedFixture";
import { SesionesSegment } from "../SesionesSegment";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "es" } }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("SesionesSegment", () => {
  it("renders the block-grouped feed once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(sessionFeedFixture);
    const container = createMockContainer({
      getSessionFeed: { execute },
      getRoutines: { execute: jest.fn().mockResolvedValue([]) },
    });

    const { getByText, getAllByText } = renderWithProviders(
      <SesionesSegment />,
      { container }
    );

    // The block header + session rows prove the feed painted (not the skeleton).
    await waitFor(() => expect(getByText("PPL Hipertrofia")).toBeTruthy());
    expect(getAllByText("Legs B").length).toBeGreaterThan(0);
  });

  it("shows the empty state when the feed has no sessions", async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ totalCount: 0, blocks: [], nextCursor: null });
    const container = createMockContainer({
      getSessionFeed: { execute },
      getRoutines: { execute: jest.fn().mockResolvedValue([]) },
    });

    const { getByText } = renderWithProviders(<SesionesSegment />, {
      container,
    });

    await waitFor(() =>
      expect(getByText("training.sessionFeed.empty")).toBeTruthy()
    );
  });

  it("shows the error state when the feed read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({
      getSessionFeed: { execute },
      getRoutines: { execute: jest.fn().mockResolvedValue([]) },
    });

    const { getByText } = renderWithProviders(<SesionesSegment />, {
      container,
    });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
