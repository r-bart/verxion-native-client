import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { mealDetailFixture } from "@/presentation/nutrition/lib/mealDetailFixture";
import { MealDetailScreen } from "../MealDetailScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "comida", planId: "definicion-2250" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("MealDetailScreen", () => {
  it("renders the meal header + items + supplements once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(mealDetailFixture);
    const container = createMockContainer({ getMealDetail: { execute } });

    const { getByText, getAllByText } = renderWithProviders(<MealDetailScreen />, {
      container,
    });

    await waitFor(() => expect(getAllByText("Comida").length).toBeGreaterThan(0));
    expect(getByText("Pechuga de pollo")).toBeTruthy();
    expect(getByText("Creatina 5 g")).toBeTruthy();
    expect(execute).toHaveBeenCalledWith("definicion-2250", "comida");
  });

  it("shows the error state when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getMealDetail: { execute } });

    const { getByText } = renderWithProviders(<MealDetailScreen />, { container });

    await waitFor(() => expect(getByText("nutrition.error.title")).toBeTruthy());
  });
});
