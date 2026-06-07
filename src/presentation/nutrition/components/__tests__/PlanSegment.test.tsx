import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  dietDashboardFixture,
  dietDashboardEmptyFixture,
} from "@/presentation/nutrition/lib/dietDashboardFixture";
import { PlanSegment } from "../PlanSegment";

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

describe("PlanSegment", () => {
  it("renders the active diet (hero + spine), not the skeleton, once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(dietDashboardFixture);
    const container = createMockContainer({ getDietDashboard: { execute } });

    const { getByText, getAllByText } = renderWithProviders(<PlanSegment />, {
      container,
    });

    // Diet name proves the active body painted; a meal name proves the spine did.
    await waitFor(() =>
      expect(getByText("Definición · 2.250 kcal")).toBeTruthy()
    );
    expect(getAllByText("Pre-entreno").length).toBeGreaterThan(0);
  });

  it("renders the diet (not the invite) in the fresh state — active diet, no intake yet today", async () => {
    const fresh = {
      ...dietDashboardFixture,
      state: "fresh" as const,
      today: {
        consumed: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
        water: { value: 0, unit: "L" as const },
        mealsLogged: 0,
        mealsTotal: 5,
      },
    };
    const execute = jest.fn().mockResolvedValue(fresh);
    const container = createMockContainer({ getDietDashboard: { execute } });

    const { getByText, queryByText } = renderWithProviders(<PlanSegment />, {
      container,
    });

    await waitFor(() =>
      expect(getByText("Definición · 2.250 kcal")).toBeTruthy()
    );
    // Must NOT fall through to the cold-start invite.
    expect(queryByText("nutrition.invite.empty.title")).toBeNull();
  });

  it("shows the cold-start invite when there is no active diet", async () => {
    const execute = jest.fn().mockResolvedValue(dietDashboardEmptyFixture);
    const container = createMockContainer({ getDietDashboard: { execute } });

    const { getByText } = renderWithProviders(<PlanSegment />, { container });

    await waitFor(() =>
      expect(getByText("nutrition.invite.empty.title")).toBeTruthy()
    );
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getDietDashboard: { execute } });

    const { getByText } = renderWithProviders(<PlanSegment />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
