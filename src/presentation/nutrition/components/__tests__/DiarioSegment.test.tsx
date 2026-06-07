import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  diaryFeedFixture,
  diaryFeedEmptyFixture,
} from "@/presentation/nutrition/lib/diaryFeedFixture";
import { DiarioSegment } from "../DiarioSegment";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("DiarioSegment", () => {
  it("renders the summary + logged days grouped by phase", async () => {
    const execute = jest.fn().mockResolvedValue(diaryFeedFixture);
    const container = createMockContainer({ getDiaryFeed: { execute } });

    const { getByText } = renderWithProviders(<DiarioSegment />, { container });

    await waitFor(() =>
      expect(getByText("Definición · 2.250 kcal")).toBeTruthy()
    );
    expect(getByText("nutrition.diary.summaryTitle")).toBeTruthy();
  });

  it("shows the empty state when no days are logged", async () => {
    const execute = jest.fn().mockResolvedValue(diaryFeedEmptyFixture);
    const container = createMockContainer({ getDiaryFeed: { execute } });

    const { getByText } = renderWithProviders(<DiarioSegment />, { container });

    await waitFor(() =>
      expect(getByText("nutrition.diary.empty.title")).toBeTruthy()
    );
  });
});
