import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  dietDayPlanFixture,
  dietDayPlanEmptyFixture,
} from "@/presentation/nutrition/lib/dietDayPlanFixture";
import { DietDayPlanScreen } from "../DietDayPlanScreen";

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

describe("DietDayPlanScreen", () => {
  it("renders the day's meals and total once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(dietDayPlanFixture);
    const container = createMockContainer({ getDietDayPlan: { execute } });

    const { getByText } = renderWithProviders(<DietDayPlanScreen />, { container });

    await waitFor(() => expect(getByText("Definición · 2.250 kcal")).toBeTruthy());
    expect(getByText("Desayuno")).toBeTruthy();
    expect(getByText("nutrition.dayPlan.total")).toBeTruthy();
  });

  it("shows the cold-start invite in the empty state", async () => {
    const execute = jest.fn().mockResolvedValue(dietDayPlanEmptyFixture);
    const container = createMockContainer({ getDietDayPlan: { execute } });

    const { getByText } = renderWithProviders(<DietDayPlanScreen />, { container });

    await waitFor(() =>
      expect(getByText("nutrition.invite.empty.title")).toBeTruthy()
    );
  });
});
