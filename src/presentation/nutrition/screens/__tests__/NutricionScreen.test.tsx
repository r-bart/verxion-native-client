import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { dietDashboardFixture } from "@/presentation/nutrition/lib/dietDashboardFixture";
import { NutricionScreen } from "../NutricionScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
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

describe("NutricionScreen", () => {
  it("renders the header, the three segments, and the Plan body", async () => {
    const execute = jest.fn().mockResolvedValue(dietDashboardFixture);
    const container = createMockContainer({ getDietDashboard: { execute } });

    const { getByText } = renderWithProviders(<NutricionScreen />, {
      container,
    });

    // Header + segmented control (i18n mocked to echo keys).
    expect(getByText("nutrition.title")).toBeTruthy();
    expect(getByText("nutrition.segments.plan")).toBeTruthy();
    expect(getByText("nutrition.segments.diario")).toBeTruthy();
    expect(getByText("nutrition.segments.alimentos")).toBeTruthy();

    // Plan segment mounts by default and paints the active diet.
    await waitFor(() =>
      expect(getByText("Definición · 2.250 kcal")).toBeTruthy()
    );
  });
});
